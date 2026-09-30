/**
 * Port of the source's `anchorXY(e, h)` helper (script_block.txt:376-383).
 *
 * Both Vérification and Lisibilité open their finding popover as a `position:
 * fixed` card anchored to the clicked run. This returns the viewport coordinates
 * for it: horizontally 60px left of the pointer, clamped to the viewport; below
 * the run unless the popover's height (`h`) would overflow, in which case above.
 */

export interface AnchorXY {
  x: number;
  y: number;
}

/** Popover width and viewport margin, both from the design. */
const POPOVER_WIDTH = 334;
const MARGIN = 12;
/** Gap between the anchored run and the popover edge. */
const GAP = 9;

export function anchorXY(event: React.MouseEvent<HTMLElement>, height: number): AnchorXY {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = Math.max(
    MARGIN,
    Math.min((event.clientX || rect.left) - 60, window.innerWidth - POPOVER_WIDTH - MARGIN),
  );
  const below = rect.bottom + GAP;
  const y =
    below + height > window.innerHeight - MARGIN
      ? Math.max(MARGIN, rect.top - height - GAP)
      : below;
  return { x: Math.round(x), y: Math.round(y) };
}

/** Popover heights the source passes to `anchorXY`, per tab. */
export const VERIFY_POPOVER_HEIGHT = 300;
export const READ_POPOVER_HEIGHT = 190;
