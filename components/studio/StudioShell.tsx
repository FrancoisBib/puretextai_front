"use client";

import { useStudioStore } from "@/lib/store/studio-store";
import { selectShellView } from "@/lib/store/selectors/shell";
import { useAutogrowTextareas } from "@/lib/hooks/use-autogrow-textareas";

import { AppHeader } from "@/components/studio/header/AppHeader";
import { ModuleSheet } from "@/components/studio/header/ModuleSheet";
import { CorrectionTab } from "@/components/studio/correction/CorrectionTab";
import { HumanizeTab } from "@/components/studio/humanize/HumanizeTab";
import { VerifyTab } from "@/components/studio/verify/VerifyTab";
import { ReadabilityTab } from "@/components/studio/readability/ReadabilityTab";
import { CountTab } from "@/components/studio/count/CountTab";
import { HistoryTab } from "@/components/studio/history/HistoryTab";
import { ProfileTab } from "@/components/studio/profile/ProfileTab";
import { UndoToast } from "@/components/studio/overlays/UndoToast";
import { ExtensionPopover } from "@/components/studio/overlays/ExtensionPopover";
import { AuthGate } from "@/components/studio/overlays/AuthGate";

/**
 * Composition root for the Studio app: the sticky header/nav, the active tab
 * (switched on `state.tab`), and the global overlays — undo toast, extension
 * panel, the mobile module sheet and the sign-up gate — that can appear on top
 * of any tab.
 */
export function StudioShell() {
  const v = useStudioStore(selectShellView);
  useAutogrowTextareas();

  return (
    <div className="min-h-screen bg-pt-bg text-pt-ink">
      <AppHeader />

      <main className="mx-auto max-w-[1240px] px-[29px] pt-[31px] pb-[86px] max-tab:px-5 max-tab:pt-[26px] max-tab:pb-[72px] max-mob:px-3.5 max-mob:pt-[18px] max-mob:pb-[104px]">
        {v.isCorrect && <CorrectionTab />}
        {v.isHuman && <HumanizeTab />}
        {v.isVerify && <VerifyTab />}
        {v.isRead && <ReadabilityTab />}
        {v.isCount && <CountTab />}
        {v.isHistory && <HistoryTab />}
        {v.isProfile && <ProfileTab />}
      </main>

      <UndoToast />
      <ExtensionPopover />
      <ModuleSheet open={v.modSheetOpen} onClose={v.closeModSheet} modules={v.modules} />
      <AuthGate />
    </div>
  );
}
