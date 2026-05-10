import { useNavigate } from "react-router-dom";
import { useLang } from "@/context/LanguageContext";
import iconCrop from "@/assets/icon-crop.png";
import iconAi from "@/assets/icon-ai.png";
import iconWeather from "@/assets/icon-weather.png";

const Menu = () => {
  const navigate = useNavigate();
  const { t } = useLang();

  return (
    <main className="min-h-screen px-4 py-6 flex flex-col">
      <header className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl text-primary">{t("appName")}</h1>
        <p className="text-muted-foreground mt-1 font-semibold">{t("menuTitle")}</p>
      </header>

      <div className="relative flex-1 max-w-3xl w-full mx-auto flex flex-col gap-4">
        <button
          onClick={() => navigate("/scanner")}
          className="tile-card flex-1 text-center"
        >
          <img
            src={iconCrop}
            alt={t("scanner")}
            className="w-40 h-40 md:w-56 md:h-56 object-contain"
          />
          <span className="text-xl md:text-3xl font-extrabold text-primary leading-tight">
            {t("scanner")}
          </span>
        </button>

        <button
          onClick={() => navigate("/weather")}
          className="tile-card flex-1 text-center"
        >
          <img
            src={iconWeather}
            alt={t("weather")}
            className="w-40 h-40 md:w-56 md:h-56 object-contain"
          />
          <span className="text-xl md:text-3xl font-extrabold text-primary leading-tight">
            {t("weather")}
          </span>
        </button>

        {/* Floating AI Chatbot circle */}
        <button
          onClick={() => navigate("/chatbot")}
          aria-label={t("chatbot")}
          className="fixed bottom-6 right-6 z-20 h-20 w-20 rounded-full bg-primary text-primary-foreground shadow-2xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition border-4 border-background"
        >
          <img
            src={iconAi}
            alt=""
            className="w-10 h-10 object-contain"
          />
          <span className="text-[10px] font-bold leading-none">AI</span>
        </button>
      </div>
    </main>
  );
};

export default Menu;
