import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * "ENG | 中" - click either side to switch the whole check-in/hospital
 * flow's language. The active side is bold/highlighted; the choice is
 * remembered (see LanguageProvider's localStorage persistence) so it
 * sticks across page reloads.
 */
export function LanguageToggle() {
    const { lang, setLang } = useLanguage();

    return (
        <div className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-sm">
            <button
                type="button"
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
                className={cn(
                    "rounded-full px-2 py-0.5 transition-colors",
                    lang === "en"
                        ? "bg-primary font-semibold text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                ENG
            </button>
            <span className="text-muted-foreground">|</span>
            <button
                type="button"
                onClick={() => setLang("zh")}
                aria-pressed={lang === "zh"}
                className={cn(
                    "rounded-full px-2 py-0.5 transition-colors",
                    lang === "zh"
                        ? "bg-primary font-semibold text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                中
            </button>
        </div>
    );
}
