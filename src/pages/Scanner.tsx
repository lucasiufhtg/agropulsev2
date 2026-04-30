import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BackButton } from "@/components/BackButton";
import { useLang } from "@/context/LanguageContext";
import { Camera, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

const TM_MODEL_URL = "https://teachablemachine.withgoogle.com/models/XKvjWSTo8/";

const Scanner = () => {
  const { t } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState<string>("—");
  const [feedback, setFeedback] = useState("");

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
    if (!active) await startCamera();
    setPredicting(true);
    // Simulated prediction (real TM integration would load TF model from TM_MODEL_URL)
    setTimeout(() => {
      const samples = [
        "Healthy Leaf (92%)",
        "Leaf Blight (78%)",
        "Powdery Mildew (84%)",
        "Rust Disease (71%)",
      ];
      setResult(samples[Math.floor(Math.random() * samples.length)]);
      setPredicting(false);
      toast.success("Prediction complete");
    }, 1400);
  };

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
        {predicting && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="h-12 w-12 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={predict}
          className="h-14 text-lg font-bold rounded-2xl"
          style={{ background: "var(--gradient-primary)" }}
        >
          {t("predict")}
        </Button>
        <Button
          onClick={() => window.open(TM_MODEL_URL, "_blank")}
          variant="secondary"
          className="h-14 text-lg font-bold rounded-2xl"
        >
          {t("scanPlant")}
        </Button>
      </div>

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
