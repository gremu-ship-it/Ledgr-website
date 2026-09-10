import type { MetadataRoute } from "next";
import { posts } from "@/lib/posts";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.siteUrl;
  const now = new Date();
  const staticPages = [
    "",
    "/features",
    "/pricing",
    "/about",
    "/contact",
    "/faq",
    "/customers",
    "/blog",
    "/privacy",
    "/terms",
  ];
  return [
    ...staticPages.map((p) => ({
      url: p === "" ? `${base}/` : `${base}${p}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.7,
    })),
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
