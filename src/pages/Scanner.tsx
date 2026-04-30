import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BackButton } from "@/components/BackButton";
import { useLang } from "@/context/LanguageContext";
import { Camera, Send, Loader2, Leaf, ShieldCheck, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import * as tmImage from "@teachablemachine/image";
import { getAdvice, type DiseaseAdvice } from "@/data/diseaseAdvice";

const TM_MODEL_URL = "https://teachablemachine.withgoogle.com/models/XKvjWSTo8/";

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
  const [feedback, setFeedback] = useState("");

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

  const submitFeedback = () => {
    if (!feedback.trim()) return toast.error("Please write feedback first");
    toast.success("Thanks for your feedback!");
    setFeedback("");
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

          {/* Top toggle buttons */}
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

          {/* Active section */}
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

          {/* Bottom quick-jump back to cure */}
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

      <div className="bg-card rounded-2xl p-4 shadow-sm">
        <p className="font-bold mb-2">{t("feedback")}</p>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Your thoughts..."
          className="rounded-xl min-h-20"
        />
        <Button onClick={submitFeedback} className="mt-3 w-full h-12 rounded-xl gap-2">
          <Send className="h-4 w-4" /> {t("submit")}
        </Button>
      </div>

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
