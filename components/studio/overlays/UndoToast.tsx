"use client";

import { useTranslations } from "next-intl";
import { useStudioStore } from "@/lib/store/studio-store";
import { selectShellView } from "@/lib/store/selectors/shell";

/**
 * Global fixed bottom-centered "undo" toast, rendered outside the tab
 * `sc-if` chain so it can appear on top of any tab. Shown whenever the
 * store's `toastKey` is non-empty (`toastOpen` in the shell selector);
 * resolved against the `common` namespace (`errors.<code>` or
 * `toasts.<name>`) at render time so it always matches the site locale.
 *
 * Auto-dismiss is store-owned: `studio-store.ts`'s `toast()` helper (used
 * by `apply`/`ignore`/`mute`/`applyAll`/`ignoreAll`/`transRun`) already
 * starts a `setTimeout(() => set({ toastKey: "", undoSnap: null }), 5000)`
 * and clears any previous timer, so this component does not need its own
 * `useEffect` timer — it just renders/hides based on `toastOpen`.
 */
export function UndoToast() {
  const v = useStudioStore(selectShellView);
  const t = useTranslations("common");

  if (!v.toastOpen) return null;

  return (
    <div
      className="animate-pt-up fixed bottom-[25px] flex items-center gap-[13px] rounded-full text-[#F6F5F2] max-mob:bottom-[calc(78px+env(safe-area-inset-bottom,0px))] max-mob:w-[calc(100%-26px)] max-mob:justify-between"
      style={{
        left: "50%",
        transform: "translateX(-50%)",
        background: "#14120F",
        padding: "10px 11px 10px 18px",
        boxShadow: "0 16px 40px rgba(20,18,15,.26)",
        zIndex: 45,
      }}
    >
      <span className="text-[13px]">{t(v.toastKey, v.toastParams)}</span>
      <button
        type="button"
        onClick={v.undo}
        className="rounded-full border-0 text-white cursor-pointer font-sans text-[12.5px] font-semibold hover:bg-[rgba(246,245,242,.22)]"
        style={{ background: "rgba(246,245,242,.12)", padding: "7px 14px" }}
      >
        {t("undo")}
      </button>
    </div>
  );
}
