import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/BackButton";
import { useLang } from "@/context/LanguageContext";
import { Search, Square, Bot, User } from "lucide-react";

type Msg = { role: "user" | "bot"; text: string };

const Chatbot = () => {
  const { t } = useLang();
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hello farmer! 🌱 How can I help you today?" },
  ]);
  const [busy, setBusy] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMsgs((m) => [...m, { role: "user", text: userText }]);
    setInput("");
    setBusy(true);
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text: `Here are tips about "${userText}":\n• Water early morning\n• Check leaves daily\n• Use organic fertilizer`,
        },
      ]);
      setBusy(false);
    }, 900);
  };

  const stop = () => setBusy(false);

  return (
    <main className="min-h-screen px-4 py-6 max-w-2xl mx-auto flex flex-col gap-4 h-screen">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-xl font-bold text-primary">{t("chatbot")}</h1>
        <div className="w-20" />
      </div>

      <p className="text-center text-muted-foreground font-bold tracking-wide">
        {t("askAnything")}
      </p>

      <div className="flex-1 bg-card rounded-2xl p-4 shadow-sm overflow-y-auto flex flex-col gap-3">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "bot" && (
              <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 whitespace-pre-line ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-secondary text-secondary-foreground rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
            {m.role === "user" && (
              <div className="w-9 h-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                <User className="h-5 w-5" />
              </div>
            )}
          </div>
        ))}
        {busy && <p className="text-muted-foreground italic">Thinking...</p>}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={t("typeMessage")}
          className="h-14 rounded-2xl text-base px-4"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={send}
          disabled={busy}
          className="h-14 text-lg font-bold rounded-2xl gap-2"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Search className="h-5 w-5" /> {t("search")}
        </Button>
        <Button
          onClick={stop}
          variant="destructive"
          className="h-14 text-lg font-bold rounded-2xl gap-2"
        >
          <Square className="h-5 w-5" /> {t("stop")}
        </Button>
      </div>
    </main>
  );
};

export default Chatbot;
