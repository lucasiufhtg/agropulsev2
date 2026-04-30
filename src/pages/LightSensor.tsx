import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import { useLang } from "@/context/LanguageContext";
import { Sun } from "lucide-react";
import { toast } from "sonner";

const LightSensor = () => {
  const { t } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [light, setLight] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        canvasRef.current = canvas;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        const tick = () => {
          if (videoRef.current && ctx) {
            ctx.drawImage(videoRef.current, 0, 0, 64, 64);
            const { data } = ctx.getImageData(0, 0, 64, 64);
            let sum = 0;
            for (let i = 0; i < data.length; i += 4) {
              sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            }
            const avg = sum / (data.length / 4);
            setLight(Math.round(avg));
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        toast.error("Camera access required for light sensing");
      }
    })();

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const exitApp = () => {
    window.close();
    toast("Please close the tab to exit.");
  };

  return (
    <main className="min-h-screen relative bg-black overflow-hidden">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />

      <div className="relative z-10 p-4 flex flex-col h-screen">
        <div className="flex items-center justify-between">
          <BackButton />
          <h1 className="text-white text-xl font-bold">{t("light")}</h1>
          <div className="w-20" />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div
            className="rounded-3xl px-8 py-6 backdrop-blur-md flex flex-col items-center gap-3"
            style={{ background: "hsl(0 0% 0% / 0.45)" }}
          >
            <Sun className="h-12 w-12 text-accent" />
            <p className="text-white/80 font-semibold text-lg">
              {t("lightValue")}:
            </p>
            <p className="text-6xl font-extrabold text-accent tabular-nums">
              {light}
            </p>
            <p className="text-white/70 text-sm">0 (dark) — 255 (bright)</p>
          </div>
        </div>

        <Button
          onClick={exitApp}
          variant="destructive"
          className="h-14 text-lg font-bold rounded-2xl"
        >
          {t("exit")}
        </Button>
      </div>
    </main>
  );
};

export default LightSensor;
