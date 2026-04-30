import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export const BackButton = ({ to = "/menu" }: { to?: string }) => {
  const navigate = useNavigate();
  const { t } = useLang();
  return (
    <Button
      onClick={() => navigate(to)}
      variant="secondary"
      size="lg"
      className="gap-2 text-base font-bold rounded-2xl h-12 px-6"
    >
      <ArrowLeft className="h-5 w-5" />
      {t("back")}
    </Button>
  );
};
