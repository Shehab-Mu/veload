import type {
  VArticleSkeletonProps,
  VCardSkeletonProps,
  VDashboardSkeletonProps,
  VFeedSkeletonProps,
  VFormSkeletonProps,
  VListSkeletonProps,
  VMediaCardSkeletonProps,
  VProductCardSkeletonProps,
  VPatternSkeletonProps,
  VProfileSkeletonProps,
  VTableSkeletonProps,
} from "veload";

/**
 * Extracts the prop names of a component type.
 *
 * The lists below are checked against the real prop types exported by the
 * package, so a preset can never advertise a prop it does not accept.
 */
type PropNames<T> = Extract<keyof T, string>;

const articleProps: PropNames<VArticleSkeletonProps>[] = [
  "rows",
  "mediaHeight",
  "showMedia",
  "color",
  "highlightColor",
  "animated",
  "label",
];

const cardProps: PropNames<VCardSkeletonProps>[] = [
  "rows",
  "mediaHeight",
  "showMedia",
  "showAvatar",
  "color",
  "highlightColor",
  "animated",
  "label",
];

const dashboardProps: PropNames<VDashboardSkeletonProps>[] = [
  "rows",
  "columns",
  "showChart",
  "showStats",
  "color",
  "highlightColor",
  "animated",
  "label",
];

const feedProps: PropNames<VFeedSkeletonProps>[] = [
  "rows",
  "showAvatar",
  "color",
  "highlightColor",
  "animated",
  "label",
];

const formProps: PropNames<VFormSkeletonProps>[] = [
  "rows",
  "showSubmit",
  "color",
  "highlightColor",
  "animated",
  "label",
];

const listProps: PropNames<VListSkeletonProps>[] = [
  "rows",
  "showAvatar",
  "avatarSize",
  "color",
  "highlightColor",
  "animated",
  "label",
];

const mediaCardProps: PropNames<VMediaCardSkeletonProps>[] = [
  "rows",
  "mediaHeight",
  "color",
  "highlightColor",
  "animated",
  "label",
];

const productCardProps: PropNames<VProductCardSkeletonProps>[] = [
  "mediaHeight",
  "showRating",
  "showPrice",
  "showCta",
  "color",
  "highlightColor",
  "animated",
  "label",
];

const profileProps: PropNames<VProfileSkeletonProps>[] = [
  "rows",
  "avatarSize",
  "showStats",
  "color",
  "highlightColor",
  "animated",
  "label",
];

const tableProps: PropNames<VTableSkeletonProps>[] = [
  "rows",
  "columns",
  "showHeader",
  "color",
  "highlightColor",
  "animated",
  "label",
];

export const skeletonPresetPropNames: Record<
  string,
  readonly string[]
> = {
  VArticleSkeleton: articleProps,
  VCardSkeleton: cardProps,
  VDashboardSkeleton: dashboardProps,
  VFeedSkeleton: feedProps,
  VFormSkeleton: formProps,
  VListSkeleton: listProps,
  VMediaCardSkeleton: mediaCardProps,
  VProductCardSkeleton: productCardProps,
  VProfileSkeleton: profileProps,
  VTableSkeleton: tableProps,
  VPatternSkeleton: ["rows", "color", "highlightColor", "animated", "label"] satisfies PropNames<VPatternSkeletonProps>[],
};
