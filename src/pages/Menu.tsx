import { useNavigate } from "react-router-dom";
import { useLang } from "@/context/LanguageContext";
import iconCrop from "@/assets/icon-crop.png";
import iconAi from "@/assets/icon-ai.png";
import iconLight from "@/assets/icon-light.png";
import iconWeather from "@/assets/icon-weather.png";

const Menu = () => {
  const navigate = useNavigate();
  const { t } = useLang();

  const tiles = [
    { key: "scanner", img: iconCrop, label: t("scanner"), to: "/scanner" },
    { key: "chatbot", img: iconAi, label: t("chatbot"), to: "/chatbot" },
    { key: "light", img: iconLight, label: t("light"), to: "/light" },
    { key: "weather", img: iconWeather, label: t("weather"), to: "/weather" },
  ];

  return (
    <main className="min-h-screen px-4 py-6 flex flex-col">
      <header className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl text-primary">{t("appName")}</h1>
        <p className="text-muted-foreground mt-1 font-semibold">{t("menuTitle")}</p>
      </header>

      <div className="grid grid-cols-2 gap-4 flex-1 max-w-3xl w-full mx-auto">
        {tiles.map((tile) => (
          <button
            key={tile.key}
            onClick={() => navigate(tile.to)}
            className="tile-card text-center"
          >
            <img
              src={tile.img}
              alt={tile.label}
              width={512}
              height={512}
              loading="lazy"
              className="w-24 h-24 md:w-32 md:h-32 object-contain"
            />
            <span className="text-sm md:text-lg font-extrabold text-primary leading-tight">
              {tile.label}
            </span>
          </button>
        ))}
      </div>
    </main>
  );
};

export default Menu;
