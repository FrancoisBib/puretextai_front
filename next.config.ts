import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  async redirects() {
    // Old bookmarks/links to the pre-i18n app route — never indexed, so no
    // SEO equity to preserve, just a courtesy for anyone with it saved.
    return [{ source: "/studio", destination: "/", permanent: true }];
  },
};

export default withNextIntl(nextConfig);
