import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware `Link`/`useRouter`/`usePathname`/`redirect` — use these instead
 * of `next/link`/`next/navigation` for every internal route (`/`, `/tarifs`,
 * `/connexion`) so links resolve to the active locale automatically (e.g.
 * `/en/tarifs` while on the English site).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
