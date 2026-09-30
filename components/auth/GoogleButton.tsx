"use client";

import { useTranslations } from "next-intl";

/** The official Google "G" mark (brand guidelines asset), not a design placeholder. */
function GoogleMark() {
  return (
    <svg aria-hidden className="h-[17px] w-[17px] flex-none" viewBox="0 0 48 48">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17Z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46Z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.93 21.93 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7Z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07Z"
      />
    </svg>
  );
}

/**
 * "Continuer avec Google" button, shared by the sign-up gate and the
 * /connexion screen.
 */
export function GoogleButton({ onClick }: { onClick: () => void }) {
  const t = useTranslations("auth.google");

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[11px] border border-[rgba(20,18,15,.16)] bg-white px-4 py-[11px] font-sans text-[13.5px] font-semibold text-[#14120F] hover:border-[rgba(20,18,15,.38)] hover:bg-[#FBFAF8]"
    >
      <GoogleMark />
      {t("continue")}
    </button>
  );
}

/** The "ou" rule between the Google button and the email form. */
export function AuthDivider({ className }: { className?: string }) {
  const t = useTranslations("auth.google");

  return (
    <div className={`flex items-center gap-[11px] ${className ?? "my-[17px]"}`}>
      <span className="h-px flex-1 bg-[rgba(20,18,15,.09)]" />
      <span className="text-[11px] uppercase tracking-[.07em] text-[#A8A29A]">{t("divider")}</span>
      <span className="h-px flex-1 bg-[rgba(20,18,15,.09)]" />
    </div>
  );
}
