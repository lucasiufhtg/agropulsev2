import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLang, Lang } from "@/context/LanguageContext";
import logo from "@/assets/logo-agropulse.png";

const options: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "zh", label: "华语" },
  { code: "ta", label: "தமிழ்" },
];

const LanguageSelect = () => {
  const navigate = useNavigate();
  const { setLang, t } = useLang();

  const choose = (l: Lang) => {
    setLang(l);
    navigate("/menu");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10">
      <img src={logo} alt="AgroPulse" width={768} height={768} className="w-32 h-32 object-contain mb-4" loading="lazy" />
      <h1 className="text-3xl md:text-4xl text-center mb-10 text-foreground">
        {t("chooseLang")}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
        {options.map((o) => (
          <Button
            key={o.code}
            onClick={() => choose(o.code)}
            className="h-24 text-2xl font-bold rounded-3xl shadow-md hover:scale-[1.02] transition-transform"
            style={{ background: "var(--gradient-primary)" }}
          >
            {o.label}
          </Button>
        ))}
      </div>
    </main>
  );
};

export default LanguageSelect;
