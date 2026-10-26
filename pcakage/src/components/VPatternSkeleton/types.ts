export type SkeletonPattern = "lines" | "article" | "card" | "profile" | "list" | "table" | "media" | "form" | "dashboard" | "feed" | "product";

export interface SkeletonAppearanceProps {
  color?: string;
  highlightColor?: string;
  animated?: boolean;
  label?: string;
}

export interface VPatternSkeletonProps extends SkeletonAppearanceProps {
  /** Layout pattern. @default "lines" */
  pattern?: SkeletonPattern;
  /** Repeated lines, items, fields, or data rows (1–12). Table/dashboard headers are separate; dashboard always includes one header. @default 3 */
  rows?: number;
  /** Table column count. @default 3 */
  columns?: number;
  /** Image or media height in pixels or a CSS length. */
  mediaHeight?: number | string;
  /** Avatar diameter in pixels. */
  avatarSize?: number;
  /** Enables optional media blocks where the pattern supports them. @default true */
  showMedia?: boolean;
  /** Enables optional avatar blocks where the pattern supports them. @default true */
  showAvatar?: boolean;
  /** Enables a table header. @default true */
  showHeader?: boolean;
  /** Enables the dashboard chart block. @default true */
  showChart?: boolean;
  /** Enables profile or dashboard statistic blocks. @default true */
  showStats?: boolean;
  /** Enables the form submit block. @default true */
  showSubmit?: boolean;
  /** Enables the product rating block. @default true */
  showRating?: boolean;
  /** Enables the product price block. @default true */
  showPrice?: boolean;
  /** Enables the product call-to-action block. @default true */
  showCta?: boolean;
}

export type NamedSkeletonProps = Omit<VPatternSkeletonProps, "pattern">;
export type VArticleSkeletonProps = Pick<NamedSkeletonProps, "rows" | "mediaHeight" | "showMedia"> & SkeletonAppearanceProps;
export type VCardSkeletonProps = Pick<NamedSkeletonProps, "rows" | "mediaHeight" | "showMedia" | "showAvatar"> & SkeletonAppearanceProps;
export type VDashboardSkeletonProps = Pick<NamedSkeletonProps, "rows" | "columns" | "showChart" | "showStats"> & SkeletonAppearanceProps;
export type VFeedSkeletonProps = Pick<NamedSkeletonProps, "rows" | "showAvatar"> & SkeletonAppearanceProps;
export type VFormSkeletonProps = Pick<NamedSkeletonProps, "rows" | "showSubmit"> & SkeletonAppearanceProps;
export type VListSkeletonProps = Pick<NamedSkeletonProps, "rows" | "showAvatar" | "avatarSize"> & SkeletonAppearanceProps;
export type VMediaCardSkeletonProps = Pick<NamedSkeletonProps, "rows" | "mediaHeight"> & SkeletonAppearanceProps;
export type VProductCardSkeletonProps = Pick<NamedSkeletonProps, "mediaHeight" | "showRating" | "showPrice" | "showCta"> & SkeletonAppearanceProps;
export type VProfileSkeletonProps = Pick<NamedSkeletonProps, "rows" | "avatarSize" | "showStats"> & SkeletonAppearanceProps;
export type VTableSkeletonProps = Pick<NamedSkeletonProps, "rows" | "columns" | "showHeader"> & SkeletonAppearanceProps;
