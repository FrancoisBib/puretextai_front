import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://puretext.ai";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/connexion", "/en/connexion"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
