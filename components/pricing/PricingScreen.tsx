"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

import { useStudioStore } from "@/lib/store/studio-store";
import { selectPlanView } from "@/lib/store/selectors/plan";
import type { PlanRowView } from "@/lib/store/selectors/plan";
import { AppHeader } from "@/components/studio/header/AppHeader";
import { PLAN_PRICES, formatPlanPrice } from "@/lib/config/plans";

/**
 * The "Formules" page (markup.html:1101-1155).
 *
 * The argument the page makes: no tool is behind the paywall — Correction,
 * Vérification, Lisibilité and Compteur all work for free. What Studio lifts
 * is the per-run volume cap and the Maximale intensity.
 *
 * Picking a plan returns to the Studio, where the change is visible: in the
 * prototype both were the same action, because this page was a tab.
 */
export function PricingScreen() {
  const v = useStudioStore(selectPlanView);
  const t = useTranslations("pricing");
  const router = useRouter();
  const locale = useLocale();

  const pick = (choose: () => void) => () => {
    choose();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-pt-bg text-pt-ink">
      <AppHeader />

      <main className="flex flex-1 items-center justify-center px-[29px] py-[31px] max-tab:px-5 max-tab:py-[26px] max-mob:px-3.5 max-mob:py-[18px]">
        <div className="animate-pt-in mx-auto w-full max-w-[1240px]">
          <div className="mx-auto mb-[26px] max-w-[880px] text-center">
            <h1 className="m-0 font-serif text-[40px] font-normal leading-[1.1] tracking-[-0.01em] max-mob:text-[27px]">
              {t("heading")}
              <span className="italic text-[#049FDE]"> {t("headingEmphasis")}</span>
            </h1>
            <p className="mx-auto mt-[11px] mb-0 max-w-[60ch] text-pretty text-[#55514A]">{t("subheading")}</p>
          </div>

          <div className="mx-auto grid max-w-[880px] grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-[18px]">
            <section className="flex flex-col justify-between rounded-[18px] border border-[rgba(20,18,15,.09)] bg-white p-6">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[.1em] text-[#8A857C]">
                  {t("free.label")}
                </div>
                <div className="mt-2.5 mb-[3px] flex items-baseline gap-1.5">
                  <span className="font-serif text-[44px] leading-none">0 €</span>
                  <span className="text-[13px] text-[#8A857C]">{t("free.forever")}</span>
                </div>
                <p className="mt-0 mb-[18px] text-[13px] text-[#55514A]">{t("free.description")}</p>
                <PlanRows rows={v.freeRows} markColor="#A8A29A" t={t} />
              </div>
              <button
                type="button"
                onClick={pick(v.pickFree)}
                className="mt-[21px] w-full cursor-pointer rounded-[11px] border border-[rgba(20,18,15,.14)] bg-transparent px-4 py-[11px] text-center font-sans text-[13.5px] font-semibold text-[#14120F] hover:border-[rgba(20,18,15,.35)]"
              >
                {v.planFree ? t("free.ctaActive") : t("free.cta")}
              </button>
            </section>

            <section className="flex flex-col justify-between rounded-[18px] border border-[#14120F] bg-[#14120F] p-6 text-[#F6F5F2] shadow-[0_18px_44px_rgba(20,18,15,.18)]">
              <div>
                <div className="flex items-center gap-[9px]">
                  <span className="text-[11px] font-bold uppercase tracking-[.1em] text-[#6FC9F2]">
                    {t("studio.label")}
                  </span>
                  <span className="rounded-full bg-[#6FC9F2] px-[7px] py-[3px] text-[10.5px] font-semibold uppercase tracking-[.06em] text-[#14120F]">
                    {t("studio.recommended")}
                  </span>
                </div>
                <div className="mt-2.5 mb-[3px] flex items-baseline gap-1.5">
                  <span className="font-serif text-[44px] leading-none">
                    {formatPlanPrice(PLAN_PRICES.studio.monthlyCents, locale)}
                  </span>
                  <span className="text-[13px] text-[rgba(246,245,242,.66)]">{t("studio.perMonth")}</span>
                </div>
                <p className="mt-0 mb-[18px] text-[13px] text-[rgba(246,245,242,.78)]">{t("studio.billingNote")}</p>
                <PlanRows rows={v.studioRows} markColor="#6FC9F2" dark t={t} />
              </div>
              <button
                type="button"
                onClick={pick(v.pickStudio)}
                className="mt-[21px] w-full cursor-pointer rounded-[11px] border border-[#049FDE] bg-[#049FDE] px-4 py-[11px] text-center font-sans text-[13.5px] font-semibold text-white hover:bg-[#0378A9]"
              >
                {v.planFree ? t("studio.cta") : t("studio.ctaActive")}
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function PlanRows({
  rows,
  markColor,
  dark = false,
  t,
}: {
  rows: PlanRowView[];
  markColor: string;
  dark?: boolean;
  t: (key: string) => string;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <div key={r.key} className="flex items-baseline gap-2.5 text-[13px] leading-[1.5]">
          <span style={{ color: markColor }} className="w-[14px] flex-none text-center">
            ·
          </span>
          <span className={dark ? "flex-1 text-[rgba(246,245,242,.84)]" : "flex-1 text-[#4A4741]"}>
            <strong className={dark ? "font-semibold text-white" : "font-semibold text-[#14120F]"}>
              {t(`rows.${r.key}.name`)}
            </strong>{" "}
            — {t(`rows.${r.key}.${r.studio ? "studio" : "free"}`)}
          </span>
        </div>
      ))}
    </div>
  );
}
