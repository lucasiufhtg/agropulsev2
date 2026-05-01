import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BackButton } from "@/components/BackButton";
import { useLang } from "@/context/LanguageContext";
import {
  Camera,
  Send,
  Loader2,
  Leaf,
  ShieldCheck,
  Stethoscope,
  ThumbsUp,
  ThumbsDown,
  CloudUpload,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import * as tmImage from "@teachablemachine/image";
import { getAdvice, type DiseaseAdvice } from "@/data/diseaseAdvice";

const TM_MODEL_URL = "https://teachablemachine.withgoogle.com/models/XKvjWSTo8/";

// TODO: Replace with full Google Apps Script Web App URL
const CLOUD_UPLOAD_URL =
  "https://script.google.com/macros/s/AKfycbxWcfF_u_vD3G_X8P3X9X_X";
const DRIVE_FOLDER_ID = "1eJff5Le_llSL8hCBpjkzv50HaIAecsojJ";

const formatTimestamp = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const Scanner = () => {
  const { t } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modelRef = useRef<tmImage.CustomMobileNet | null>(null);
  const [active, setActive] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [result, setResult] = useState<string>("—");
  const [topLabel, setTopLabel] = useState<string>("");
  const [advice, setAdvice] = useState<DiseaseAdvice | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);
  const [adviceTab, setAdviceTab] = useState<"cure" | "cause" | "prevention">("cure");

  // Cloud feedback state
  const [snapDataUrl, setSnapDataUrl] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<"True" | "False" | null>(null);
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);

  const loadModel = async () => {
    if (modelRef.current) return modelRef.current;
    setModelLoading(true);
    try {
      const model = await tmImage.load(
        TM_MODEL_URL + "model.json",
        TM_MODEL_URL + "metadata.json"
      );
      modelRef.current = model;
      return model;
    } finally {
      setModelLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch {
      toast.error("Could not access camera");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  };

  useEffect(() => () => stopCamera(), []);

  const predict = async () => {
    try {
      if (!active) await startCamera();
      setPredicting(true);
      const model = await loadModel();
      if (!videoRef.current) return;
      const predictions = await model.predict(videoRef.current);
      predictions.sort((a, b) => b.probability - a.probability);
      const top = predictions[0];
      const pct = (top.probability * 100).toFixed(1);
      setTopLabel(top.className);
      setResult(`${top.className} (${pct}%)`);
      setShowAdvice(false);
      setAdvice(null);
      toast.success("Prediction complete");
    } catch (err) {
      console.error(err);
      toast.error("Prediction failed");
    } finally {
      setPredicting(false);
    }
  };

  const showPlantAdvice = () => {
    if (!topLabel) {
      toast.error("Please run Predict first");
      return;
    }
    const a = getAdvice(topLabel);
    if (!a) {
      toast.error("No advice available for this result");
      return;
    }
    setAdvice(a);
    setAdviceTab("cure");
    setShowAdvice(true);
  };

  const tabConfig = {
    cure: { title: "How to Cure", icon: Stethoscope, items: advice?.cure ?? [] },
    cause: { title: "Cause", icon: Leaf, items: advice?.cause ?? [] },
    prevention: { title: "Prevention", icon: ShieldCheck, items: advice?.prevention ?? [] },
  } as const;

  // ===== Cloud feedback handlers =====
  const snapPhoto = async () => {
    try {
      if (!active) await startCamera();
      if (!videoRef.current) return;
      const v = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = v.videoWidth || 640;
      canvas.height = v.videoHeight || 640;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setSnapDataUrl(dataUrl);
      setSentOk(false);
      toast.success("Photo captured");
    } catch (err) {
      console.error(err);
      toast.error("Could not snap photo");
    }
  };

  const sendToCloud = async (
    verdictOverride?: "True" | "False",
    opts: { silent?: boolean; reset?: boolean } = {}
  ) => {
    const finalVerdict = verdictOverride ?? verdict;
    if (!finalVerdict) {
      if (!opts.silent) toast.error("Tap 👍 or 👎 first");
      return;
    }

    if (!opts.silent) {
      setSending(true);
      setSentOk(false);
    }
    try {
      const base64 = snapDataUrl ? (snapDataUrl.split(",")[1] ?? "") : "";
      const filename = `${formatTimestamp(new Date())}_img.jpg`;
      const payload = {
        filename,
        folderid: DRIVE_FOLDER_ID,
        mimetype: "image/jpeg",
        data: base64,
        prediction: finalVerdict,
        feedback: notes,
      };

      await fetch(CLOUD_UPLOAD_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(payload),
      });

      if (!opts.silent) {
        setSentOk(true);
        toast.success("Success! Report saved to Google Drive.");
      }
      if (opts.reset) {
        setNotes("");
        setVerdict(null);
        setSnapDataUrl(null);
      }
    } catch (err) {
      console.error(err);
      if (!opts.silent) toast.error("Upload failed. Please try again.");
    } finally {
      if (!opts.silent) setSending(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-xl font-bold text-primary">{t("scanner")}</h1>
        <div className="w-20" />
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-muted-foreground">
          {t("diseasePredicted")}:
        </p>
        <p className="text-2xl font-extrabold text-primary mt-1">{result}</p>
      </div>

      <div className="relative aspect-square bg-black rounded-3xl overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 gap-2">
            <Camera className="h-16 w-16" />
            <p>Camera preview</p>
          </div>
        )}
        {(predicting || modelLoading) && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 text-white">
            <Loader2 className="h-12 w-12 animate-spin" />
            <p className="text-sm">{modelLoading ? "Loading model..." : "Analyzing..."}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={predict}
          disabled={predicting || modelLoading}
          className="h-14 text-lg font-bold rounded-2xl"
          style={{ background: "var(--gradient-primary)" }}
        >
          {t("predict")}
        </Button>
        <Button
          onClick={showPlantAdvice}
          variant="secondary"
          className="h-14 text-lg font-bold rounded-2xl"
        >
          {t("scanPlant")}
        </Button>
      </div>

      {showAdvice && advice && (
        <div className="bg-card rounded-2xl p-4 shadow-sm space-y-4">
          <p className="text-lg font-extrabold text-primary">{topLabel}</p>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setAdviceTab("cause")}
              variant={adviceTab === "cause" ? "default" : "outline"}
              className="h-12 rounded-xl font-bold gap-2"
            >
              <Leaf className="h-4 w-4" /> Cause
            </Button>
            <Button
              onClick={() => setAdviceTab("prevention")}
              variant={adviceTab === "prevention" ? "default" : "outline"}
              className="h-12 rounded-xl font-bold gap-2"
            >
              <ShieldCheck className="h-4 w-4" /> Prevention
            </Button>
          </div>

          <section className="bg-muted/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              {(() => {
                const Icon = tabConfig[adviceTab].icon;
                return <Icon className="h-6 w-6 text-primary" />;
              })()}
              <h2 className="font-extrabold text-lg text-primary">
                {tabConfig[adviceTab].title}
              </h2>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-base">
              {tabConfig[adviceTab].items.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>

          {adviceTab !== "cure" && (
            <Button
              onClick={() => setAdviceTab("cure")}
              className="w-full h-12 rounded-xl font-bold gap-2"
            >
              <Stethoscope className="h-4 w-4" /> Show How to Cure
            </Button>
          )}
        </div>
      )}

      {/* ============ CLOUD FEEDBACK CARD ============ */}
      <section className="bg-card rounded-3xl p-5 shadow-md border border-border/60 space-y-5">
        {/* Verdict */}
        <div className="space-y-2">
          <p className="text-sm font-bold">Is it wrong?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setVerdict("True"); sendToCloud("True", { silent: true }); }}
              type="button"
              aria-label="Thumbs up"
              className={`h-16 rounded-2xl flex items-center justify-center border-2 transition ${
                verdict === "True"
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                  : "bg-background border-border hover:border-primary/50"
              }`}
            >
              <ThumbsUp className="h-7 w-7" />
            </button>
            <button
              onClick={() => { setVerdict("False"); sendToCloud("False", { silent: true }); }}
              type="button"
              aria-label="Thumbs down"
              className={`h-16 rounded-2xl flex items-center justify-center border-2 transition ${
                verdict === "False"
                  ? "bg-destructive text-destructive-foreground border-destructive shadow-md scale-[1.02]"
                  : "bg-background border-border hover:border-destructive/50"
              }`}
            >
              <ThumbsDown className="h-7 w-7" />
            </button>
          </div>
        </div>

        {verdict && (
          <>
            {/* Snap photo */}
            <div className="flex gap-3 items-center">
              <button
                onClick={snapPhoto}
                className="relative h-20 w-20 shrink-0 rounded-2xl border-2 border-dashed border-primary/40 bg-muted/30 flex items-center justify-center overflow-hidden hover:bg-muted/50 transition"
                type="button"
              >
                {snapDataUrl ? (
                  <img
                    src={snapDataUrl}
                    alt="Snapped leaf"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-7 w-7 text-primary/60" />
                )}
              </button>
              <Button
                onClick={snapPhoto}
                className="flex-1 h-14 rounded-2xl text-base font-bold gap-2"
                variant="secondary"
              >
                <Camera className="h-5 w-5" />
                {snapDataUrl ? "Retake" : "Snap Photo"}
              </Button>
            </div>

            {/* Notes */}
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              className="rounded-2xl min-h-24 text-base"
            />

            {/* Submit (only after thumb clicked) */}
            <Button
              onClick={() => sendToCloud()}
              disabled={sending}
              className="w-full h-16 rounded-2xl text-lg font-extrabold gap-2 shadow-lg"
              style={{ background: "var(--gradient-primary)" }}
            >
              {sending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <CloudUpload className="h-5 w-5" /> SEND
                </>
              )}
            </Button>
          </>
        )}

        {sentOk && (
          <div className="flex items-center gap-2 rounded-2xl bg-primary/10 text-primary px-4 py-3 font-semibold">
            <CheckCircle2 className="h-5 w-5" />
            Success! Report saved to Google Drive.
          </div>
        )}
      </section>

      <Button
        asChild
        className="h-14 text-lg font-bold rounded-2xl bg-sky text-sky-foreground hover:bg-sky/90"
      >
        <a
          href="https://t.me/agroscan8920839"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("joinTg")}
        </a>
      </Button>
    </main>
  );
};

export default Scanner;
