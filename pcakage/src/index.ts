export { default as VSpinner } from "./components/VSpinner/index.vue";
export type { VSpinnerProps } from "./components/VSpinner/types";

export { default as VSkeleton } from "./components/VSkeleton/index.vue";
export type {
  VSkeletonProps,
  SkeletonVariant,
} from "./components/VSkeleton/types";

export { default as VProgress } from "./components/VProgress/index.vue";
export type { VProgressProps } from "./components/VProgress/types";

export { default as VLoading } from "./components/VLoading/index.vue";
export type { VLoadingProps } from "./components/VLoading/types";

export { default as VLoadingButton } from "./components/VLoadingButton/index.vue";
export type {
  VLoadingButtonProps,
  LoadingButtonType,
} from "./components/VLoadingButton/types";

export { default as VLoader } from "./components/VLoader/index.vue";
export {
  VBarsLoader,
  VBlobLoader,
  VBounceLoader,
  VBreathingLoader,
  VCardFlipLoader,
  VDotSweepLoader,
  VDotsLoader,
  VDualArcLoader,
  VElementLoader,
  VEqualizerLoader,
  VFallbackLoader,
  VFlowLoader,
  VGradientRingLoader,
  VGridLoader,
  VHashtagLoader,
  VHeatmapLoader,
  VLiquidLoader,
  VLogoSpinLoader,
  VMorphLoader,
  VOrbitDotsLoader,
  VOrbitLoader,
  VPlaneLoader,
  VProgressRingLoader,
  VPulseLoader,
  VRingLoader,
  VRippleLoader,
  VRotateLoader,
  VSignalLoader,
  VSlidingBarsLoader,
  VSnakeLoader,
  VSpinDotsLoader,
  VSpinLoader,
  VSquaresLoader,
  VStairLoader,
  VTypingLoader,
  VWaveLoader,
} from "./components/VLoader/loaders";
export type { LoaderVariant, NamedLoaderProps, VLoaderProps, VMarkLoaderProps, VProgressRingLoaderProps } from "./components/VLoader/types";

export { default as VPatternSkeleton } from "./components/VPatternSkeleton/index.vue";
export { default as VSkeletonGroup } from "./components/VSkeletonGroup/index.vue";
export type { VSkeletonGroupProps } from "./components/VSkeletonGroup/types";
export { default as VSkeletonSwitch } from "./components/VSkeletonSwitch/index.vue";
export type { VSkeletonSwitchProps } from "./components/VSkeletonSwitch/types";
export {
  VAutoSkeleton,
  VArticleSkeleton,
  VCardSkeleton,
  VDashboardSkeleton,
  VFeedSkeleton,
  VFormSkeleton,
  VListSkeleton,
  VMediaCardSkeleton,
  VProductCardSkeleton,
  VProfileSkeleton,
  VSkeletonLoader,
  VTableSkeleton,
} from "./components/VPatternSkeleton/presets";
export type { VAutoSkeletonProps } from "./components/VPatternSkeleton/presets";
export type {
  NamedSkeletonProps,
  SkeletonPattern,
  VArticleSkeletonProps,
  VCardSkeletonProps,
  VDashboardSkeletonProps,
  VFeedSkeletonProps,
  VFormSkeletonProps,
  VListSkeletonProps,
  VMediaCardSkeletonProps,
  VPatternSkeletonProps,
  VProductCardSkeletonProps,
  VProfileSkeletonProps,
  VTableSkeletonProps,
} from "./components/VPatternSkeleton/types";

export { useLoading, type UseLoadingReturn } from "./composables/useLoading";
export {
  useDelayedLoading,
  type UseDelayedLoadingOptions,
  type UseDelayedLoadingReturn,
} from "./composables/useDelayedLoading";
export {
  useLoadingGroup,
  type UseLoadingGroupReturn,
  type LoadingSource,
} from "./composables/useLoadingGroup";
