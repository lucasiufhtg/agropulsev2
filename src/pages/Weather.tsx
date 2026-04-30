import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/BackButton";
import { useLang } from "@/context/LanguageContext";
import { Cloud, Wind, Droplets, Thermometer, CalendarDays, Clock, Gauge, Loader2 } from "lucide-react";

type WeatherData = {
  date: string;
  time: string;
  wind: string;
  rain: string;
  temp: string;
  humidity: string;
  condition: string;
};

const Weather = () => {
  const { t } = useLang();
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const getData = () => {
    setLoading(true);
    setTimeout(() => {
      const now = new Date();
      setData({
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        wind: `${(5 + Math.random() * 15).toFixed(1)} km/h`,
        rain: `${(Math.random() * 10).toFixed(1)} mm`,
        temp: `${(26 + Math.random() * 6).toFixed(1)} °C`,
        humidity: `${(60 + Math.random() * 30).toFixed(0)} %`,
        condition: ["Sunny", "Partly Cloudy", "Light Rain", "Cloudy"][Math.floor(Math.random() * 4)],
      });
      setLoading(false);
    }, 900);
  };

  const items = data
    ? [
        { icon: CalendarDays, label: t("date"), value: data.date },
        { icon: Clock, label: t("time"), value: data.time },
        { icon: Wind, label: t("wind"), value: data.wind },
        { icon: Droplets, label: t("rain"), value: data.rain },
        { icon: Thermometer, label: t("temp"), value: data.temp },
        { icon: Gauge, label: t("humidity"), value: data.humidity },
      ]
    : [];

  return (
    <main className="min-h-screen px-4 py-6 max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-xl font-bold text-primary">{t("weather")}</h1>
        <div className="w-20" />
      </div>

      <Button
        onClick={getData}
        disabled={loading}
        className="h-16 text-xl font-bold rounded-2xl gap-2"
        style={{ background: "var(--gradient-sky)" }}
      >
        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Cloud className="h-6 w-6" />}
        {t("getData")}
      </Button>

      {data && (
        <>
          <div
            className="rounded-3xl p-6 text-sky-foreground text-center shadow-md"
            style={{ background: "var(--gradient-sky)" }}
          >
            <Cloud className="h-16 w-16 mx-auto mb-2" />
            <p className="text-3xl font-extrabold">{data.condition}</p>
            <p className="text-5xl font-extrabold mt-2">{data.temp}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {items.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-card rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-semibold">{label}</span>
                </div>
                <p className="text-xl font-bold text-primary mt-1">{value}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {!data && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-16">
          <Cloud className="h-20 w-20 mb-3" />
          <p className="font-semibold">Tap "{t("getData")}" to view weather</p>
        </div>
      )}
    </main>
  );
};

export default Weather;
