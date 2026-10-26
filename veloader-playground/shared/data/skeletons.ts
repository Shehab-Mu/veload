import type { SkeletonPattern } from "veloader";

/**
 * Metadata of a named skeleton preset.
 *
 * The data is free of Vue imports so it can be shared by the application and
 * by the server routes that build the sitemap.
 */
export interface SkeletonPresetMeta {
  /** Stable URL segment, for example `article-skeleton`. */
  slug: string;
  /** Exported component name, for example `VArticleSkeleton`. */
  name: string;
  /** Human readable title. */
  title: string;
  /** Pattern rendered by the preset. */
  pattern: SkeletonPattern;
  /** One line summary shown on cards. */
  description: string;
  /** Short notes describing the layout. */
  highlights: string[];
  /** Whether the preset is part of the curated homepage selection. */
  featured: boolean;
}

export const skeletonPresets: SkeletonPresetMeta[] = [
  {
    slug: "article-skeleton",
    name: "VArticleSkeleton",
    title: "Article",
    pattern: "article",
    description: "Long-form reading layout",
    highlights: [
      "Optional media block followed by a headline and body rows.",
      "The last row is shortened so the block looks like real copy.",
      "Use `showMedia` to remove the leading image.",
    ],
    featured: true,
  },
  {
    slug: "card-skeleton",
    name: "VCardSkeleton",
    title: "Card",
    pattern: "card",
    description: "Media card with inline author",
    highlights: [
      "Optional media block plus an inline avatar and title row.",
      "Matches the shape of a typical content card.",
      "Toggle `showMedia` and `showAvatar` independently.",
    ],
    featured: true,
  },
  {
    slug: "dashboard-skeleton",
    name: "VDashboardSkeleton",
    title: "Dashboard",
    pattern: "dashboard",
    description: "Statistics, chart and table",
    highlights: [
      "Statistic tiles, a chart block and a table with one fixed header.",
            "Rows counts data rows only; the header, chart and statistic tiles are separate sections.",
      "Column count drives both the table and the statistic row.",
      "Use `showChart` to collapse the chart block.",
    ],
    featured: true,
  },
  {
    slug: "feed-skeleton",
    name: "VFeedSkeleton",
    title: "Feed",
    pattern: "feed",
    description: "Timeline of posts",
    highlights: [
      "Repeated rows with an optional avatar and divider.",
      "Separators between items keep long feeds scannable.",
      "Each item contains a title and two supporting lines.",
    ],
    featured: false,
  },
  {
    slug: "form-skeleton",
    name: "VFormSkeleton",
    title: "Form",
    pattern: "form",
    description: "Labelled input fields",
    highlights: [
      "A label above each field mirrors real form markup.",
      "The optional submit block reserves the button space.",
      "Ideal for lazy-loading a settings panel.",
    ],
    featured: false,
  },
  {
    slug: "list-skeleton",
    name: "VListSkeleton",
    title: "List",
    pattern: "list",
    description: "Avatar list rows",
    highlights: [
      "Compact rows with an optional leading avatar.",
      "Suitable for sidebars, inboxes and pickers.",
      "Two text lines per row keep the block dense.",
    ],
    featured: false,
  },
  {
    slug: "media-card-skeleton",
    name: "VMediaCardSkeleton",
    title: "Media card",
    pattern: "media",
    description: "Media block with supporting copy",
    highlights: [
      "A media block sits next to the supporting text.",
      "Uses a two column layout on wide containers.",
      "The media height is configurable with `mediaHeight`.",
    ],
    featured: false,
  },
  {
    slug: "product-card-skeleton",
    name: "VProductCardSkeleton",
    title: "Product card",
    pattern: "product",
    description: "Catalogue product placeholder",
    highlights: [
      "Media, title, rating, price and call-to-action blocks.",
      "Each optional block can be switched off individually.",
      "Matches the structure of a commerce product card.",
    ],
    featured: false,
  },
  {
    slug: "profile-skeleton",
    name: "VProfileSkeleton",
    title: "Profile",
    pattern: "profile",
    description: "Profile header with statistics",
    highlights: [
      "An avatar beside the name and supporting lines.",
      "Optional statistic tiles span the full width.",
      "The avatar size is configurable with `avatarSize`.",
    ],
    featured: false,
  },
  {
    slug: "table-skeleton",
    name: "VTableSkeleton",
    title: "Table",
    pattern: "table",
    description: "Data grid rows",
    highlights: [
      "A header row and configurable body rows.",
      "Column count drives the grid template.",
      "Disable `showHeader` for headerless data grids.",
    ],
    featured: false,
  },
];

export const linesSkeleton: SkeletonPresetMeta = {
  slug: "lines",
  name: "VPatternSkeleton",
  title: "Lines",
  pattern: "lines",
  description: "Plain text placeholder rows",
  highlights: [
    "The default lines pattern of VPatternSkeleton; no separate named export is needed.",
    "Rows controls the exact number of text lines, from one to twelve.",
    "The last line is shortened to suggest the end of a paragraph.",
  ],
  featured: false,
};

/** All interactive skeleton detail pages, including the generic lines pattern. */
export const skeletonDetails: SkeletonPresetMeta[] = [...skeletonPresets, linesSkeleton];

export function skeletonPatternPath(pattern: SkeletonPattern): string {
  const detail = skeletonDetails.find((entry) => entry.pattern === pattern);
  if (!detail) throw new Error(`No skeleton detail page for pattern: ${pattern}`);
  return `/skeletons/${detail.slug}`;
}

export const featuredSkeletonPresets: SkeletonPresetMeta[] =
  skeletonPresets.filter((entry) => entry.featured);

export interface SkeletonPatternMeta {
  /** Pattern value understood by `VPatternSkeleton`. */
  pattern: SkeletonPattern;
  /** Human readable title. */
  title: string;
  /** One line summary. */
  description: string;
}

export const skeletonPatterns: SkeletonPatternMeta[] = [
  { pattern: "lines", title: "Lines", description: "Plain text rows" },
  { pattern: "article", title: "Article", description: "Media and body copy" },
  { pattern: "card", title: "Card", description: "Media card with author" },
  { pattern: "profile", title: "Profile", description: "Avatar and statistics" },
  { pattern: "list", title: "List", description: "Compact avatar rows" },
  { pattern: "table", title: "Table", description: "Header and data rows" },
  { pattern: "media", title: "Media", description: "Media block with copy" },
  { pattern: "form", title: "Form", description: "Labelled fields" },
  {
    pattern: "dashboard",
    title: "Dashboard",
    description: "Stats, chart and table",
  },
  { pattern: "feed", title: "Feed", description: "Timeline of posts" },
  { pattern: "product", title: "Product", description: "Catalogue product card" },
];

export function findSkeletonPreset(slug: string): SkeletonPresetMeta | undefined {
  return skeletonPresets.find((entry) => entry.slug === slug);
}

export function findSkeletonDetail(slug: string): SkeletonPresetMeta | undefined {
  return skeletonDetails.find((entry) => entry.slug === slug);
}
