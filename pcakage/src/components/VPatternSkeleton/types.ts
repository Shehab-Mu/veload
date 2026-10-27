export type SkeletonPattern = "lines" | "article" | "card" | "profile" | "list" | "table" | "media" | "form" | "dashboard" | "feed" | "product";

export interface SkeletonAppearanceProps {
  color?: string;
  highlightColor?: string;
  animated?: boolean;
  label?: string;
}

export interface VPatternSkeletonProps extends SkeletonAppearanceProps {
  pattern?: SkeletonPattern;
  rows?: number;
  columns?: number;
  mediaHeight?: number | string;
  avatarSize?: number;
  showMedia?: boolean;
  showAvatar?: boolean;
  showHeader?: boolean;
  showChart?: boolean;
  showStats?: boolean;
  showSubmit?: boolean;
  showRating?: boolean;
  showPrice?: boolean;
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
