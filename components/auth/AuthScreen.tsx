"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { useState } from "react";

import { useStudioStore } from "@/lib/store/studio-store";
import { googleLoginUrl } from "@/lib/api/auth";
import { apiErrorCode } from "@/lib/api/client";
import { GoogleButton, AuthDivider } from "./GoogleButton";
import { CredentialsFields } from "./CredentialsFields";
import { OtpStep } from "./OtpStep";

/**
 * The full-page sign-in / sign-up screen (markup.html:1052-1098). It is shown
 * without the app header — the design hides the chrome on this screen — and
 * on submit calls the real backend (§4) before returning to the Studio.
 */
export function AuthScreen() {
  const router = useRouter();
  const login = useStudioStore((s) => s.login);
  const signup = useStudioStore((s) => s.signup);
  const verifyEmailCode = useStudioStore((s) => s.verifyEmailCode);
  const resendEmailCode = useStudioStore((s) => s.resendEmailCode);
  const leaveOtp = useStudioStore((s) => s.leaveOtp);
  const pendingEmail = useStudioStore((s) => s.pendingEmail);
  const otpLoading = useStudioStore((s) => s.authLoading);
  const otpError = useStudioStore((s) => s.authError);
  const [mode, setMode] = useState<"signup" | "login" | "otp">("signup");
  const isLogin = mode === "login";
  const tOtp = useTranslations("auth.otp");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = useTranslations("auth");
  const tGate = useTranslations("auth.gate");
  const tCommon = useTranslations("common");

  const submit = async () => {
    setErrorCode(null);
    setLoading(true);
    try {
      const outcome = isLogin ? await login(email, password) : await signup(email, password);
      if (outcome === "otp") setMode("otp");
      else router.push("/");
    } catch (err) {
      setErrorCode(apiErrorCode(err));
    } finally {
      setLoading(false);
    }
  };

  const brand = (
    <Link
      href="/"
      aria-label={t("page.backLink")}
      title={t("page.backLink")}
      className="mb-7 flex w-full items-center justify-center gap-[9px]"
    >
      <Image src="/logo-puretext.png" alt="" width={28} height={28} className="block flex-none" />
      {/* `a { color }` in globals.css overrides any Tailwind text-color utility here
          (unlayered base rule beats the layered utilities) — the inline `color` on
          this span is what actually keeps "PureText" black instead of accent blue. */}
      <span style={{ fontWeight: 600, fontSize: 23, letterSpacing: "-0.02em", color: "#14120F" }}>
        PureText<span className="text-[#049FDE]"> AI</span>
      </span>
    </Link>
  );

  if (mode === "otp") {
    return (
      <div className="animate-pt-in mx-auto w-full max-w-[430px] px-5 py-10">
        <div className="mb-5 text-center">
          <h1 className="m-0 font-serif text-[34px] font-normal leading-[1.15]">{tOtp("title")}</h1>
          <p className="mt-2 mb-0 text-[13.5px] text-pretty text-[#55514A]">
            {tOtp.rich("sub", {
              email: pendingEmail,
              b: (chunks) => <strong className="font-semibold text-[#14120F]">{chunks}</strong>,
            })}
          </p>
        </div>
        <section className="rounded-[18px] border border-[rgba(20,18,15,.09)] bg-white p-6 shadow-[0_1px_2px_rgba(20,18,15,.05),0_14px_34px_rgba(20,18,15,.045)]">
          {brand}
          <OtpStep
            loading={otpLoading}
            errorCode={otpError}
            onVerify={async (code) => {
              await verifyEmailCode(code);
              router.push("/");
            }}
            onResend={resendEmailCode}
            showResentInline
            onChangeEmail={() => {
              leaveOtp();
              setMode("signup");
            }}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="animate-pt-in mx-auto w-full max-w-[430px] px-5 py-10">
      <div className="mb-5 text-center">
        <h1 className="m-0 font-serif text-[34px] font-normal leading-[1.15]">
          {isLogin ? tGate("loginTitle") : t("page.signupTitle")}
        </h1>
        <p className="mt-2 mb-0 text-[13.5px] text-pretty text-[#55514A]">
          {isLogin ? t("page.loginSub") : t("page.signupSub")}
        </p>
      </div>

      <section className="rounded-[18px] border border-[rgba(20,18,15,.09)] bg-white p-6 shadow-[0_1px_2px_rgba(20,18,15,.05),0_14px_34px_rgba(20,18,15,.045)]">
        {brand}
        <GoogleButton onClick={() => { window.location.href = googleLoginUrl(); }} />
        <AuthDivider />
        <CredentialsFields
          passwordPlaceholder={isLogin ? tGate("loginPwPlaceholder") : tGate("signupPwPlaceholder")}
          showForgot={isLogin}
          email={email}
          onEmailChange={setEmail}
          password={password}
          onPasswordChange={setPassword}
          isSignup={!isLogin}
        />

        {errorCode && <p className="mt-3 mb-0 text-[12.5px] text-[#C0392B]">{tCommon(`errors.${errorCode}`)}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="mt-[18px] w-full cursor-pointer rounded-[11px] border border-[#049FDE] bg-[#049FDE] px-4 py-3 font-sans text-[13.5px] font-semibold text-white shadow-[0_2px_10px_rgba(4,159,222,.25)] hover:bg-[#0378A9] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? tCommon("loading") : isLogin ? tGate("loginCta") : tGate("signupCta")}
        </button>

        {!isLogin && (
          <p className="mt-[13px] mb-0 text-center text-[11.5px] leading-[1.5] text-pretty text-[#8A857C]">
            {t("page.legal")}
          </p>
        )}
      </section>

      <p className="mt-4 mb-0 text-center text-[13px] text-[#55514A]">
        {isLogin ? tGate("loginSwitchText") : tGate("signupSwitchText")}
        <button
          type="button"
          onClick={() => {
            setMode(isLogin ? "signup" : "login");
            setErrorCode(null);
          }}
          className="ml-1 cursor-pointer border-0 bg-transparent p-0 font-sans text-[13px] font-semibold text-[#049FDE] underline"
        >
          {isLogin ? tGate("loginSwitchCta") : tGate("signupSwitchCta")}
        </button>
      </p>
    </div>
  );
}
