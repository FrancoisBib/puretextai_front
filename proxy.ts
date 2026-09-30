import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Every path except Next internals, static files and API-shaped assets.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
