import type { Component } from "vue";
import {
  VArticleSkeleton,
  VBlobLoader,
  VBarsLoader,
  VBounceLoader,
  VBreathingLoader,
  VCardFlipLoader,
  VCardSkeleton,
  VDashboardSkeleton,
  VDotSweepLoader,
  VDotsLoader,
  VDualArcLoader,
  VElementLoader,
  VEqualizerLoader,
  VFallbackLoader,
  VFeedSkeleton,
  VFlowLoader,
  VFormSkeleton,
  VGradientRingLoader,
  VGridLoader,
  VHashtagLoader,
  VHeatmapLoader,
  VLiquidLoader,
  VListSkeleton,
  VLogoSpinLoader,
  VMediaCardSkeleton,
  VMorphLoader,
  VOrbitDotsLoader,
  VOrbitLoader,
  VPlaneLoader,
  VPatternSkeleton,
  VProductCardSkeleton,
  VProfileSkeleton,
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
  VTableSkeleton,
  VTypingLoader,
  VWaveLoader,
} from "veload";
import {
  findLoader,
  featuredLoaders as featuredLoaderList,
  loaderCategories as loaderCategoryList,
  loaderVariants as loaderVariantList,
  loaders as loaderMeta,
  type LoaderCategory,
  type LoaderMeta,
} from "#shared/data/loaders";
import {
  findSkeletonPreset,
  findSkeletonDetail,
  skeletonPatternPath,
  skeletonDetails,
  featuredSkeletonPresets as featuredSkeletonPresetList,
  skeletonPatterns as skeletonPatternList,
  skeletonPresets as skeletonPresetMeta,
  type SkeletonPatternMeta,
  type SkeletonPresetMeta,
} from "#shared/data/skeletons";

export type {
  LoaderCategory,
  LoaderMeta,
  SkeletonPatternMeta,
  SkeletonPresetMeta,
};

export const loaderCategories: LoaderCategory[] = loaderCategoryList;
export const loaderVariants = loaderVariantList;
export const skeletonPatterns: SkeletonPatternMeta[] = skeletonPatternList;

const loaderComponents: Record<string, Component> = {
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
};


export function getLoaderComponent(name: string): Component {
  const component = loaderComponents[name];

  if (!component) {
    throw new Error(`Unknown loader component: ${name}`);
  }

  return component;
}

const skeletonPresetComponents: Record<string, Component> = {
  VPatternSkeleton,
  VArticleSkeleton,
  VCardSkeleton,
  VDashboardSkeleton,
  VFeedSkeleton,
  VFormSkeleton,
  VListSkeleton,
  VMediaCardSkeleton,
  VProductCardSkeleton,
  VProfileSkeleton,
  VTableSkeleton,
};


export function getSkeletonPresetComponent(name: string): Component {
  const component = skeletonPresetComponents[name];

  if (!component) {
    throw new Error(`Unknown skeleton preset: ${name}`);
  }

  return component;
}

export const loaders: LoaderMeta[] = loaderMeta;
export const featuredLoaders: LoaderMeta[] = featuredLoaderList;
export const skeletonPresets: SkeletonPresetMeta[] = skeletonPresetMeta;
export const featuredSkeletonPresets: SkeletonPresetMeta[] =
  featuredSkeletonPresetList;

export { findLoader, findSkeletonPreset, findSkeletonDetail, skeletonPatternPath, skeletonDetails };
