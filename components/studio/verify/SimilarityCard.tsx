"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui";
import type { ActiveSimSource } from "@/lib/store/selectors/verify";

export interface SimilarityCardProps {
  simStatusKey: "loading" | "done" | "idle";
  simLoading: boolean;
  simDone: boolean;
  simError: string | null;
  simScore: number;
  simColor: string;
  simVerdictKey: string | null;
  simHasMulti: boolean;
  simSrcPos: number;
  simSrcCount: number;
  simSrcPrev: () => void;
  simSrcNext: () => void;
  simEmpty: boolean;
  simActive: ActiveSimSource | null;
}

/**
 * "Similarité" sidebar card: while the search runs, a simple loading
 * message (a real web-search-backed request has no determinate progress
 * to fake); once done, a big serif percentage, verdict, and a source
 * browser (prev/next when there's more than one match) showing the
 * active matched passage — real title/host/excerpt from
 * `POST /v1/similarity`, not translated demo content.
 */
export function SimilarityCard({
  simStatusKey,
  simLoading,
  simDone,
  simError,
  simScore,
  simColor,
  simVerdictKey,
  simHasMulti,
  simSrcPos,
  simSrcCount,
  simSrcPrev,
  simSrcNext,
  simEmpty,
  simActive,
}: SimilarityCardProps) {
  const t = useTranslations("studio.verify");
  const tCommon = useTranslations("common");

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-[9px] px-[17px] py-[13px]">
        <span className="text-[13.5px] font-semibold">{t("similarity.heading")}</span>
        <span className="flex-1" />
        <span className="text-[11px] font-semibold tracking-[.06em] uppercase text-[#8A857C]">
          {t(`simStatus.${simStatusKey}`)}
        </span>
      </div>

      {simLoading && (
        <div className="px-[17px] pt-1 pb-[22px]">
          <p className="m-0 flex items-center gap-2 text-[12.5px] font-semibold text-[#55514A]">
            <span className="animate-pt-pulse h-[7px] w-[7px] flex-none rounded-full bg-[#049FDE]" />
            {t("similarity.searching")}
          </p>
        </div>
      )}

      {!simLoading && simError && (
        <p className="m-0 px-[17px] pb-[17px] text-[12.5px] text-[#C0392B]" style={{ textWrap: "pretty" }}>
          {tCommon(`errors.${simError}`)}
        </p>
      )}

      {simDone && simVerdictKey && (
        <div>
          <div className="px-[17px] pb-[17px] border-b border-[rgba(20,18,15,.07)]">
            <div className="flex items-baseline gap-[5px]">
              <span className="font-serif text-[34px] leading-none" style={{ color: simColor }}>
                {simScore}
              </span>
              <span className="font-serif text-[18px]" style={{ color: simColor }}>
                %
              </span>
              <span className="text-[11.5px] text-[#8A857C] pl-[3px]">{t("similarity.foundElsewhere")}</span>
            </div>
            <p className="mt-[10px] mb-0 text-[13.5px] font-semibold" style={{ color: simColor }}>
              {t(`simVerdict.${simVerdictKey}`)}
            </p>
            <p className="mt-1 mb-0 text-[12.5px] text-[#55514A]" style={{ textWrap: "pretty" }}>
              {t(`simVerdictSub.${simVerdictKey}`)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 px-[17px] py-3 border-b border-[rgba(20,18,15,.07)] bg-[#FCFBF9]">
              <span className="flex-1 text-[11px] font-bold tracking-[.09em] uppercase text-[#8A857C]">
                {simSrcCount ? t("similarity.sourceLabel", { n: simSrcCount }) : t("similarity.sourceLabelEmpty")}
              </span>
              {simHasMulti && (
                <>
                  <button
                    onClick={simSrcPrev}
                    className="w-[23px] h-[23px] grid place-items-center bg-white border border-[rgba(20,18,15,.12)] rounded-[6px] cursor-pointer text-[12px] text-[#4A4741] hover:border-[#049FDE] hover:text-[#049FDE]"
                  >
                    ←
                  </button>
                  <button
                    onClick={simSrcNext}
                    className="w-[23px] h-[23px] grid place-items-center bg-white border border-[rgba(20,18,15,.12)] rounded-[6px] cursor-pointer text-[12px] text-[#4A4741] hover:border-[#049FDE] hover:text-[#049FDE]"
                  >
                    →
                  </button>
                  <span className="text-[11.5px] font-semibold text-[#55514A] tabular-nums">
                    {simSrcPos}/{simSrcCount}
                  </span>
                </>
              )}
            </div>

            {simActive && (
              <div className="px-[17px] pt-[14px] pb-[17px]">
                <div
                  className="rounded-xl px-3 py-[11px]"
                  style={{ border: `1px solid ${simActive.border}`, background: simActive.cardBg }}
                >
                  <div className="flex items-start gap-2">
                    <a
                      href={simActive.host ? `https://${simActive.host}` : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12.5px] font-semibold leading-[1.45] min-w-0 text-[#14120F] hover:text-[#049FDE]"
                      style={{ textWrap: "pretty" }}
                    >
                      {simActive.title}
                    </a>
                    <span className="flex-1" />
                    <span
                      className="text-[12px] font-bold tabular-nums flex-none whitespace-nowrap leading-[1.45]"
                      style={{ color: simActive.color }}
                    >
                      {simActive.pct}
                    </span>
                  </div>
                  <div className="text-[11.5px] leading-[1.5] text-[#8A857C] my-[3px] mb-[9px]">{simActive.host}</div>
                  <div
                    className="text-[12.5px] leading-[1.55] text-[#4A4741] pl-[9px]"
                    style={{ borderLeft: `2px solid ${simActive.color}`, textWrap: "pretty" }}
                  >
                    « {simActive.matchedExcerpt} »
                  </div>
                  <div className="flex gap-[6px] mt-[10px] flex-wrap">
                    <button
                      onClick={simActive.locate}
                      className="bg-transparent border border-[rgba(20,18,15,.12)] text-[#14120F] rounded-lg px-[10px] py-[6px] cursor-pointer text-[12px] font-medium whitespace-nowrap hover:border-[#049FDE] hover:text-[#049FDE]"
                    >
                      {t("similarity.seeInText")}
                    </button>
                    <button
                      onClick={() => simActive.copyRef(simActive.title)}
                      className="bg-transparent border border-[rgba(20,18,15,.12)] text-[#14120F] rounded-lg px-[10px] py-[6px] cursor-pointer text-[12px] font-medium whitespace-nowrap hover:border-[#049FDE] hover:text-[#049FDE]"
                    >
                      {t("similarity.copyReference")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {simEmpty && (
              <p className="m-0 px-[17px] pb-[17px] text-[12.5px] text-[#55514A]" style={{ textWrap: "pretty" }}>
                {t("similarity.noMatch")}
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
