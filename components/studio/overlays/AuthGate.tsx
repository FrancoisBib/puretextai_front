"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { useStudioStore } from "@/lib/store/studio-store";
import { selectPlanView } from "@/lib/store/selectors/plan";
import { googleLoginUrl } from "@/lib/api/auth";
import { GoogleButton, AuthDivider } from "@/components/auth/GoogleButton";
import { CredentialsFields } from "@/components/auth/CredentialsFields";
import { OtpStep } from "@/components/auth/OtpStep";

/**
 * The sign-up wall (markup.html:1202-1256). It opens on the second run of a
 * metered tool when there is no account, and signs in/up directly against
 * the backend (§4). Signup — or login on an unconfirmed account — continues
 * into the 6-digit email code step; no session until the code is confirmed.
 */
export function AuthGate() {
  const v = useStudioStore(selectPlanView);
  const t = useTranslations("auth.gate");
  const tOtp = useTranslations("auth.otp");
  const tCommon = useTranslations("common");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!v.gateOpen) return null;

  if (v.gateIsOtp) {
    return (
      <div
        onClick={v.gateClose}
        className="animate-pt-in fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(20,18,15,.42)] p-6 backdrop-blur-[3px]"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={tOtp("title")}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[396px] rounded-[18px] bg-white p-[26px] shadow-[0_24px_64px_rgba(20,18,15,.28)]"
        >
          <h2 className="m-0 font-serif text-[27px] font-normal leading-[1.15]">{tOtp("title")}</h2>
          <p className="mt-[7px] mb-5 text-[13px] leading-[1.55] text-pretty text-[#55514A]">
            {tOtp.rich("sub", {
              email: v.gatePendingEmail,
              b: (chunks) => <strong className="font-semibold text-[#14120F]">{chunks}</strong>,
            })}
          </p>
          <OtpStep
            loading={v.gateLoading}
            errorCode={v.gateError}
            onVerify={v.gateVerify}
            onResend={v.gateResend}
            onChangeEmail={v.gateLeaveOtp}
          />
        </div>
      </div>
    );
  }

  const isLogin = v.gateMode === "login";
  const gateTitle = t(isLogin ? "loginTitle" : "signupTitle");
  const gateSub = t(isLogin ? "loginSub" : "signupSub");
  const gateCta = t(isLogin ? "loginCta" : "signupCta");
  const gatePwPlaceholder = t(isLogin ? "loginPwPlaceholder" : "signupPwPlaceholder");
  const gateSwitchText = t(isLogin ? "loginSwitchText" : "signupSwitchText");
  const gateSwitchCta = t(isLogin ? "loginSwitchCta" : "signupSwitchCta");

  const submit = async () => {
    try {
      if (v.gateMode === "login") await v.gateLogin(email, password);
      else await v.gateSignup(email, password);
    } catch {
      // authError is already set by the store action — nothing else to do here.
    }
  };

  return (
    <div
      onClick={v.gateClose}
      className="animate-pt-in fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(20,18,15,.42)] p-6 backdrop-blur-[3px]"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={gateTitle}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[396px] rounded-[18px] bg-white p-[26px] shadow-[0_24px_64px_rgba(20,18,15,.28)]"
      >
        <h2 className="m-0 font-serif text-[27px] font-normal leading-[1.15]">{gateTitle}</h2>
        <p className="mt-[7px] mb-[18px] text-[13px] leading-[1.55] text-pretty text-[#55514A]">{gateSub}</p>

        <GoogleButton onClick={() => { window.location.href = googleLoginUrl(); }} />
        <AuthDivider className="my-[15px]" />
        <CredentialsFields
          passwordPlaceholder={gatePwPlaceholder}
          gap="gap-[11px]"
          email={email}
          onEmailChange={setEmail}
          password={password}
          onPasswordChange={setPassword}
          isSignup={v.gateIsSignup}
        />

        {v.gateError && <p className="mt-3 mb-0 text-[12.5px] text-[#C0392B]">{tCommon(`errors.${v.gateError}`)}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={v.gateLoading}
          className="mt-4 w-full cursor-pointer rounded-[11px] border border-[#049FDE] bg-[#049FDE] px-4 py-3 font-sans text-[13.5px] font-semibold text-white shadow-[0_2px_10px_rgba(4,159,222,.25)] hover:bg-[#0378A9] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {v.gateLoading ? tCommon("loading") : gateCta}
        </button>

        <p className="mt-[13px] mb-0 text-center text-[12.5px] text-[#55514A]">
          {gateSwitchText}
          <button
            type="button"
            onClick={v.gateSwitch}
            className="ml-1 cursor-pointer whitespace-nowrap border-0 bg-transparent p-0 font-sans text-[12.5px] font-semibold text-[#049FDE] underline"
          >
            {gateSwitchCta}
          </button>
        </p>
      </div>
    </div>
  );
}
