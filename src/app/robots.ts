import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Google must crawl daily pages to see their noindex directive.
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://buchstabiene.fuerst.one/sitemap.xml",
  };
}
