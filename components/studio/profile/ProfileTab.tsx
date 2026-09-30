"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useStudioStore } from "@/lib/store/studio-store";
import { selectShellView } from "@/lib/store/selectors/shell";
import { selectProfileView, type ProfileQuotaRow } from "@/lib/store/selectors/profile";
import { INTENSITY_KEYS } from "@/lib/store/selectors/humanize";
import { LANGS } from "@/lib/engines/language/languages.data";
import { PLAN_PRICES, formatPlanPrice } from "@/lib/config/plans";
import { Card, EmptyState } from "@/components/ui";

const QUOTA_ROW_ORDER: ProfileQuotaRow["key"][] = ["correct", "humanize", "verify"];

/** `ProfileQuotaRow.key` uses the API's `quotas.*` names — `nav.json` names the Humanisation tab `"human"`, not `"humanize"`. */
const QUOTA_NAV_KEY: Record<ProfileQuotaRow["key"], "correct" | "human" | "verify"> = {
  correct: "correct",
  humanize: "human",
  verify: "verify",
};

/**
 * "Profil" screen, reachable only via the header avatar dropdown (not a
 * top-nav tab). Reads `GET /v1/me` (`loadProfile()`, triggered on mount) —
 * read-only for now, `PATCH /v1/me` isn't wired yet. Three cards:
 * Abonnement, Quota du mois, Préférences ("Règles rencontrées" was removed —
 * no backend data exists for it, see the plan).
 */
export function ProfileTab() {
  const shell = useStudioStore(selectShellView);
  const v = useStudioStore(selectProfileView);
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const tPricing = useTranslations("pricing");
  const tHumanize = useTranslations("studio.humanize");
  const locale = useLocale();

  useEffect(() => {
    if (!v.loaded && !v.loading) v.retry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!v.loaded && v.loading) {
    return (
      <div className="animate-pt-in">
        <h1 className="m-0 mb-[6px] font-serif font-normal text-[34px]">{t("title")}</h1>
        <p className="m-0 text-[#55514A]">{t("loading")}</p>
      </div>
    );
  }

  if (!v.loaded && v.error) {
    return (
      <div className="animate-pt-in">
        <h1 className="m-0 mb-[19px] font-serif font-normal text-[34px]">{t("title")}</h1>
        <EmptyState
          variant="pending"
          title={tCommon(`errors.${v.error}`)}
          action={{ label: t("retry"), onClick: v.retry }}
        />
      </div>
    );
  }

  const langName = (LANGS.find((l) => l.code === v.defaultLang) ?? LANGS[0]).name;

  return (
    <div className="animate-pt-in">
      <h1 className="m-0 mb-[6px] font-serif font-normal text-[34px]">{t("title")}</h1>
      <p className="m-0 mb-[23px] text-[#55514A]">{v.displayName ?? v.email}</p>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(256px, 1fr))" }}>
        {/* Abonnement */}
        <Card elevation="none" className="p-5">
          <div className="text-[11px] font-bold tracking-[.1em] uppercase text-[#8A857C]">{t("subscription.label")}</div>
          <div className="font-serif text-[27px] mt-2 mb-[2px]">
            {tPricing(v.plan === "studio" ? "studio.label" : "free.label")}
          </div>
          <p className="m-0 mb-[14px] text-[13px] text-[#55514A]">
            {v.plan === "studio"
              ? `${formatPlanPrice(PLAN_PRICES.studio.monthlyCents, locale)} ${tPricing("studio.perMonth")}`
              : tPricing("free.forever")}
          </p>
          <button
            type="button"
            className="rounded-[9px] border border-[rgba(20,18,15,.12)] bg-transparent px-[14px] py-2 font-sans text-[13px] font-medium text-[#14120F] cursor-pointer hover:border-[#049FDE] hover:text-[#049FDE]"
          >
            {t("subscription.manage")}
          </button>
        </Card>

        {/* Quota du mois */}
        <Card elevation="none" className="p-5">
          <div className="text-[11px] font-bold tracking-[.1em] uppercase text-[#8A857C]">{t("quota.label")}</div>
          <div className="flex flex-col gap-[9px] mt-[13px] text-[13px]">
            {QUOTA_ROW_ORDER.map((key) => {
              const row = v.quotas.find((q) => q.key === key);
              return (
                <div key={key} className="flex justify-between">
                  <span>{tNav(QUOTA_NAV_KEY[key])}</span>
                  <strong className="text-[#049FDE]">
                    {row && row.runsLeft !== null ? t("quota.runsLeft", { n: row.runsLeft }) : t("quota.unlimited")}
                  </strong>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Préférences */}
        <Card elevation="none" className="p-5">
          <div className="text-[11px] font-bold tracking-[.1em] uppercase text-[#8A857C]">{t("preferences.label")}</div>
          <div className="flex flex-col gap-[11px] mt-[13px] text-[13px]">
            <div className="flex justify-between">
              <span>{t("preferences.defaultTone")}</span>
              <strong className="text-[#049FDE]">{tHumanize(`tones.${v.defaultTone ?? "Professionnel"}.label`)}</strong>
            </div>
            <div className="flex justify-between">
              <span>{t("preferences.defaultIntensity")}</span>
              <strong className="text-[#049FDE]">
                {tHumanize(`intensity.${INTENSITY_KEYS[v.defaultIntensity ?? 0]}`)}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>{t("preferences.language")}</span>
              <strong>{langName}</strong>
            </div>
            <div className="flex justify-between">
              <span>{t("preferences.extension")}</span>
              <strong>{t(shell.extOpen ? "preferences.extensionActive" : "preferences.extensionInactive")}</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
