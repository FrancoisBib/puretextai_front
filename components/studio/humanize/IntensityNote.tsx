import { useTranslations } from "next-intl";
import { Card } from "@/components/ui";
import { INTENSITY_KEYS } from "@/lib/store/selectors/humanize";

export interface IntensityNoteProps {
  intensityIndex: 0 | 1 | 2;
}

/**
 * Small static-ish card describing the current intensity level. Ported
 * from design.html lines 431-434.
 */
export function IntensityNote({ intensityIndex }: IntensityNoteProps) {
  const t = useTranslations("studio.humanize");
  const key = INTENSITY_KEYS[intensityIndex];

  return (
    <Card elevation="none" className="px-[18px] py-4">
      <div className="mb-[6px] text-[13px] font-semibold">{t("intensityHeading", { level: t(`intensity.${key}`) })}</div>
      <p className="m-0 text-[12.5px] leading-[1.6] text-[#8A857C]">{t(`intensityNote.${key}`)}</p>
    </Card>
  );
}
