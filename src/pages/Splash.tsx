import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-agropulse.png";
import { useLang } from "@/context/LanguageContext";

const Splash = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setTimeout(() => navigate("/language"), 250);
          return 100;
        }
        return p + 2;
      });
    }, 50);
    return () => clearInterval(id);
  }, [navigate]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-8 max-w-md w-full">
        <img
          src={logo}
          alt="AgroPulse logo"
          width={768}
          height={768}
          className="w-64 h-64 object-contain animate-pulse"
        />
        <div className="w-full">
          <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                background: "var(--gradient-primary)",
              }}
            />
          </div>
          <p className="text-center mt-4 text-muted-foreground font-semibold">
            {t("loading")}
          </p>
        </div>
      </div>
    </main>
  );
};

export default Splash;
