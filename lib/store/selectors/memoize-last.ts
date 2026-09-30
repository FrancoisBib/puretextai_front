/**
 * Every `select*View` derives a brand-new object on each call. Passed
 * directly to `useStudioStore(selectXView)`, that makes each snapshot a
 * fresh reference even when the underlying state hasn't changed —
 * `useSyncExternalStore` (which Zustand's hook is built on) then sees the
 * snapshot "changing" on every call and React throws "The result of
 * getServerSnapshot should be cached to avoid an infinite loop."
 *
 * This wraps a selector with a size-1 cache keyed on referential equality
 * of its input `StudioState`: since the store always produces a new state
 * object on every `set()`, two calls with the *same* state reference are
 * guaranteed to be repeat calls for an unchanged snapshot, so returning
 * the cached result is always correct — not just an optimization.
 */
export function memoizeLast<A, R>(compute: (arg: A) => R): (arg: A) => R {
  let lastArg: A | undefined;
  let lastResult: R | undefined;
  let hasResult = false;

  return (arg: A): R => {
    if (hasResult && Object.is(arg, lastArg)) {
      return lastResult as R;
    }
    const result = compute(arg);
    lastArg = arg;
    lastResult = result;
    hasResult = true;
    return result;
  };
}
