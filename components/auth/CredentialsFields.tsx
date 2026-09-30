"use client";

import { useTranslations } from "next-intl";

const FIELD_CLASS =
  "w-full rounded-[10px] border border-[rgba(20,18,15,.14)] bg-white px-3 py-2.5 font-sans text-[13.5px] text-[#14120F]";

export interface CredentialsFieldsProps {
  passwordPlaceholder: string;
  /** Shows the "Mot de passe oublié ?" hint next to the password label. */
  showForgot?: boolean;
  gap?: string;
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  /** New-account password field: browsers autofill differently for signup vs login. */
  isSignup?: boolean;
}

/** The email + password pair used by both the gate modal and /connexion. */
export function CredentialsFields({
  passwordPlaceholder,
  showForgot = false,
  gap = "gap-[13px]",
  email,
  onEmailChange,
  password,
  onPasswordChange,
  isSignup = false,
}: CredentialsFieldsProps) {
  const t = useTranslations("auth.credentials");

  return (
    <div className={`flex flex-col ${gap}`}>
      <label className="block">
        <span className="mb-[5px] block text-[12px] font-semibold">{t("emailLabel")}</span>
        <input
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className={FIELD_CLASS}
        />
      </label>
      <label className="block">
        <span className="mb-[5px] flex items-baseline gap-2">
          <span className="text-[12px] font-semibold">{t("passwordLabel")}</span>
          <span className="flex-1" />
          {showForgot && <span className="text-[11.5px] text-[#049FDE]">{t("forgotPassword")}</span>}
        </span>
        <input
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          placeholder={passwordPlaceholder}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className={FIELD_CLASS}
        />
      </label>
    </div>
  );
}
