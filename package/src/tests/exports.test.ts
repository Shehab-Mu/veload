import { describe, expect, it } from "vitest";
import { ref } from "vue";
import * as Veloader from "../index";
import type {
  LoadingButtonType,
  LoadingSource,
  NamedLoaderProps,
  SkeletonVariant,
  UseDelayedLoadingOptions,
  UseDelayedLoadingReturn,
  UseLoadingGroupReturn,
  UseLoadingReturn,
  VLoadingButtonProps,
  VLoadingProps,
  VProgressProps,
  VProgressRingLoaderProps,
  VSkeletonProps,
  VSpinnerProps,
} from "../index";

describe("public package exports", () => {
  it("exports every public component and composable from the package root", () => {
    expect(Object.keys(Veloader).sort()).toEqual(
      [
        "VArticleSkeleton", "VAutoSkeleton", "VBarsLoader", "VBlobLoader", "VBounceLoader",
        "VBreathingLoader", "VCardFlipLoader", "VCardSkeleton", "VDashboardSkeleton",
        "VDotSweepLoader", "VDotsLoader", "VDualArcLoader", "VElementLoader",
        "VEqualizerLoader", "VFallbackLoader", "VFeedSkeleton", "VFlowLoader", "VFormSkeleton",
        "VGradientRingLoader", "VGridLoader", "VHashtagLoader", "VHeatmapLoader", "VLiquidLoader",
        "VListSkeleton", "VLoader", "VLoading", "VLoadingButton", "VLogoSpinLoader",
        "VMediaCardSkeleton", "VMorphLoader", "VOrbitDotsLoader", "VOrbitLoader", "VPatternSkeleton",
        "VPlaneLoader", "VProductCardSkeleton", "VProfileSkeleton", "VProgress", "VProgressRingLoader",
        "VPulseLoader", "VRingLoader", "VRippleLoader", "VRotateLoader", "VSignalLoader", "VSkeleton",
        "VSkeletonGroup", "VSkeletonLoader", "VSkeletonSwitch", "VSlidingBarsLoader", "VSnakeLoader", "VSpinDotsLoader",
        "VSpinLoader", "VSpinner", "VSquaresLoader", "VStairLoader", "VTableSkeleton", "VTypingLoader",
        "VWaveLoader", "useDelayedLoading", "useLoading", "useLoadingGroup",
      ].sort(),
    );
  });

  it("keeps the exported public types usable", () => {
    const spinner: VSpinnerProps = { size: 32, decorative: true };
    const namedLoader: NamedLoaderProps = {
      label: "Loading archive",
      decorative: false,
    };
    const progressRing: VProgressRingLoaderProps = {
      label: "Uploading archive",
      decorative: true,
      value: 45,
    };
    const skeleton: VSkeletonProps = { variant: "circle", label: "Avatar" };
    const progress: VProgressProps = { value: 25, valueText: "25%" };
    const loading: VLoadingProps = { loading: true, inertContent: false };
    const button: VLoadingButtonProps = { loading: true, type: "submit" };
    const delayOptions: UseDelayedLoadingOptions = {
      delay: 100,
      minVisibleDuration: 200,
    };
    const source: LoadingSource = ref(false);

    const variant: SkeletonVariant = skeleton.variant ?? "text";
    const buttonType: LoadingButtonType = button.type ?? "button";
    const loadingReturn: UseLoadingReturn = Veloader.useLoading();
    const delayedReturn: UseDelayedLoadingReturn =
      Veloader.useDelayedLoading(delayOptions);
    const groupReturn: UseLoadingGroupReturn = Veloader.useLoadingGroup([source]);

    expect(spinner.size).toBe(32);
    expect(namedLoader.label).toBe("Loading archive");
    expect(namedLoader.decorative).toBe(false);
    expect(progressRing.decorative).toBe(true);
    expect(variant).toBe("circle");
    expect(buttonType).toBe("submit");
    expect(loadingReturn.isLoading.value).toBe(false);
    expect(delayedReturn.pendingCount.value).toBe(0);
    expect(groupReturn.isLoading.value).toBe(false);
    expect(progress.value).toBe(25);
    expect(loading.loading).toBe(true);
  });
});
