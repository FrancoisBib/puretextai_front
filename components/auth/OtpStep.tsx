"use client";

import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";

const CODE_LENGTH = 6;

export interface OtpStepProps {
  loading: boolean;
  /** A `common.errors.<code>` key, or null. */
  errorCode: string | null;
  onVerify: (code: string) => Promise<unknown>;
  onResend: () => Promise<void>;
  onChangeEmail: () => void;
  /**
   * The design confirms a resend with the Studio's toast; `/connexion` has no
   * toast host, so it shows the same confirmation inline instead.
   */
  showResentInline?: boolean;
}

/**
 * The 6-digit email-confirmation step that follows signup — shared by the
 * sign-up gate modal and the full-screen /connexion page. The caller renders
 * the heading (sizes differ between the two). Ported from PureText AI.dc.html
 * lines 1254-1270: six single-digit boxes, "Vérifier et continuer", then
 * "Renvoyer le code" | "Changer d'adresse".
 */
export function OtpStep({ loading, errorCode, onVerify, onResend, onChangeEmail, showResentInline }: OtpStepProps) {
  const t = useTranslations("auth.otp");
  const tCommon = useTranslations("common");
  const [digits, setDigits] = useState<string[]>(() => Array(CODE_LENGTH).fill(""));
  const [resent, setResent] = useState(false);
  const cells = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join("");

  const submit = (value: string) => {
    if (value.length !== CODE_LENGTH || loading) return;
    // Failures are already surfaced through `errorCode` by the store action.
    onVerify(value).catch(() => {
      setDigits(Array(CODE_LENGTH).fill(""));
      cells.current[0]?.focus();
    });
  };

  const fillFrom = (start: number, raw: string) => {
    const incoming = raw.replace(/\D/g, "").slice(0, CODE_LENGTH - start).split("");
    if (!incoming.length) return;
    const next = [...digits];
    incoming.forEach((d, i) => (next[start + i] = d));
    setDigits(next);
    cells.current[Math.min(start + incoming.length, CODE_LENGTH - 1)]?.focus();
    if (next.every(Boolean)) submit(next.join(""));
  };

  const onChange = (i: number, raw: string) => {
    if (raw === "") {
      const next = [...digits];
      next[i] = "";
      setDigits(next);
      return;
    }
    // Several characters at once = browser autofill of the whole code; otherwise
    // keep the last typed digit (the cell may already hold one).
    fillFrom(i, raw.length > 2 ? raw : raw.slice(-1));
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) cells.current[i - 1]?.focus();
    if (e.key === "Enter") submit(code);
  };

  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    fillFrom(i, e.clipboardData.getData("text"));
  };

  const resend = async () => {
    await onResend();
    setResent(true);
  };

  return (
    <div>
      <div className="grid grid-cols-6 gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              cells.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            autoFocus={i === 0}
            maxLength={CODE_LENGTH}
            aria-label={t("digit", { n: i + 1 })}
            value={d}
            onChange={(e) => onChange(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={(e) => onPaste(i, e)}
            className="w-full rounded-[10px] border border-[rgba(20,18,15,.16)] bg-white py-3 text-center font-sans text-[19px] font-semibold text-[#14120F] focus:border-[#049FDE] focus:outline-none"
          />
        ))}
      </div>

      {errorCode && <p className="mt-3 mb-0 text-[12.5px] text-[#C0392B]">{tCommon(`errors.${errorCode}`)}</p>}
      {showResentInline && resent && !errorCode && (
        <p className="mt-3 mb-0 text-[12.5px] text-[#1F8A54]">{t("resent")}</p>
      )}

      <button
        type="button"
        onClick={() => submit(code)}
        disabled={loading || code.length !== CODE_LENGTH}
        className="mt-[18px] w-full cursor-pointer rounded-[11px] border border-[#049FDE] bg-[#049FDE] px-4 py-3 font-sans text-[13.5px] font-semibold text-white shadow-[0_2px_10px_rgba(4,159,222,.25)] hover:bg-[#0378A9] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? tCommon("loading") : t("cta")}
      </button>

      <div className="mt-[13px] flex items-center justify-center gap-[14px]">
        <button
          type="button"
          onClick={resend}
          className="cursor-pointer whitespace-nowrap border-0 bg-transparent p-0 font-sans text-[12.5px] font-semibold text-[#049FDE] underline"
        >
          {t("resend")}
        </button>
        <span className="h-3 w-px bg-[rgba(20,18,15,.14)]" />
        <button
          type="button"
          onClick={onChangeEmail}
          className="cursor-pointer whitespace-nowrap border-0 bg-transparent p-0 font-sans text-[12.5px] text-[#8A857C] hover:text-[#14120F]"
        >
          {t("changeEmail")}
        </button>
      </div>
    </div>
  );
}
