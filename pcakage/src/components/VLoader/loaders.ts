import { defineComponent, h, type DefineComponent } from "vue";
import VLoader from "./index.vue";
import type { LoaderVariant, NamedLoaderProps } from "./types";

function createLoader(name: string, variant: LoaderVariant): DefineComponent<NamedLoaderProps> {
  const component = defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => h(VLoader, { ...attrs, variant }, slots);
    },
  });

  return component as DefineComponent<NamedLoaderProps>;
}

export const VBarsLoader = /*#__PURE__*/ createLoader("VBarsLoader", "bars");
export const VBlobLoader = /*#__PURE__*/ createLoader("VBlobLoader", "blob");
export const VBounceLoader = /*#__PURE__*/ createLoader("VBounceLoader", "bounce");
export const VBreathingLoader = /*#__PURE__*/ createLoader("VBreathingLoader", "breathing");
export const VCardFlipLoader = /*#__PURE__*/ createLoader("VCardFlipLoader", "card-flip");
export const VDotSweepLoader = /*#__PURE__*/ createLoader("VDotSweepLoader", "dot-sweep");
export const VDotsLoader = /*#__PURE__*/ createLoader("VDotsLoader", "dots");
export const VDualArcLoader = /*#__PURE__*/ createLoader("VDualArcLoader", "dual-arc");
export const VElementLoader = /*#__PURE__*/ createLoader("VElementLoader", "element");
export const VEqualizerLoader = /*#__PURE__*/ createLoader("VEqualizerLoader", "equalizer");
export const VFallbackLoader = /*#__PURE__*/ createLoader("VFallbackLoader", "fallback");
export const VFlowLoader = /*#__PURE__*/ createLoader("VFlowLoader", "flow");
export const VGradientRingLoader = /*#__PURE__*/ createLoader("VGradientRingLoader", "gradient-ring");
export const VGridLoader = /*#__PURE__*/ createLoader("VGridLoader", "grid");
export const VHashtagLoader = /*#__PURE__*/ createLoader("VHashtagLoader", "hashtag");
export const VHeatmapLoader = /*#__PURE__*/ createLoader("VHeatmapLoader", "heatmap");
export const VLiquidLoader = /*#__PURE__*/ createLoader("VLiquidLoader", "liquid");
export const VLogoSpinLoader = /*#__PURE__*/ createLoader("VLogoSpinLoader", "logo-spin");
export const VMorphLoader = /*#__PURE__*/ createLoader("VMorphLoader", "morph");
export const VOrbitDotsLoader = /*#__PURE__*/ createLoader("VOrbitDotsLoader", "orbit-dots");
export const VOrbitLoader = /*#__PURE__*/ createLoader("VOrbitLoader", "orbit");
export const VPlaneLoader = /*#__PURE__*/ createLoader("VPlaneLoader", "plane");
export const VProgressRingLoader = /*#__PURE__*/ createLoader("VProgressRingLoader", "progress-ring");
export const VPulseLoader = /*#__PURE__*/ createLoader("VPulseLoader", "pulse");
export const VRingLoader = /*#__PURE__*/ createLoader("VRingLoader", "ring");
export const VRippleLoader = /*#__PURE__*/ createLoader("VRippleLoader", "ripple");
export const VRotateLoader = /*#__PURE__*/ createLoader("VRotateLoader", "rotate");
export const VSignalLoader = /*#__PURE__*/ createLoader("VSignalLoader", "signal");
export const VSlidingBarsLoader = /*#__PURE__*/ createLoader("VSlidingBarsLoader", "sliding-bars");
export const VSnakeLoader = /*#__PURE__*/ createLoader("VSnakeLoader", "snake");
export const VSpinDotsLoader = /*#__PURE__*/ createLoader("VSpinDotsLoader", "spin-dots");
export const VSpinLoader = /*#__PURE__*/ createLoader("VSpinLoader", "spin");
export const VSquaresLoader = /*#__PURE__*/ createLoader("VSquaresLoader", "squares");
export const VStairLoader = /*#__PURE__*/ createLoader("VStairLoader", "stair");
export const VTypingLoader = /*#__PURE__*/ createLoader("VTypingLoader", "typing");
export const VWaveLoader = /*#__PURE__*/ createLoader("VWaveLoader", "wave");
