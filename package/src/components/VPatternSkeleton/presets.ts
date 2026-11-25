import { defineComponent, h, type DefineComponent } from "vue";
import VSkeleton from "../VSkeleton/index.vue";
import VSkeletonSwitch from "../VSkeletonSwitch/index.vue";
import type { VSkeletonSwitchProps } from "../VSkeletonSwitch/types";
import VPatternSkeleton from "./index.vue";
import type {
  NamedSkeletonProps,
  SkeletonPattern,
  VArticleSkeletonProps,
  VCardSkeletonProps,
  VDashboardSkeletonProps,
  VFeedSkeletonProps,
  VFormSkeletonProps,
  VListSkeletonProps,
  VMediaCardSkeletonProps,
  VProductCardSkeletonProps,
  VProfileSkeletonProps,
  VTableSkeletonProps,
} from "./types";

export const VSkeletonLoader = VSkeleton;

function createPreset<Props extends NamedSkeletonProps>(name: string, pattern: SkeletonPattern): DefineComponent<Props> {
  const component = defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs }) {
      return () => h(VPatternSkeleton, { ...attrs, pattern });
    },
  });

  return component as DefineComponent<Props>;
}

export const VArticleSkeleton = /*#__PURE__*/ createPreset<VArticleSkeletonProps>("VArticleSkeleton", "article");
export const VCardSkeleton = /*#__PURE__*/ createPreset<VCardSkeletonProps>("VCardSkeleton", "card");
export const VDashboardSkeleton = /*#__PURE__*/ createPreset<VDashboardSkeletonProps>("VDashboardSkeleton", "dashboard");
export const VFeedSkeleton = /*#__PURE__*/ createPreset<VFeedSkeletonProps>("VFeedSkeleton", "feed");
export const VFormSkeleton = /*#__PURE__*/ createPreset<VFormSkeletonProps>("VFormSkeleton", "form");
export const VListSkeleton = /*#__PURE__*/ createPreset<VListSkeletonProps>("VListSkeleton", "list");
export const VMediaCardSkeleton = /*#__PURE__*/ createPreset<VMediaCardSkeletonProps>("VMediaCardSkeleton", "media");
export const VProductCardSkeleton = /*#__PURE__*/ createPreset<VProductCardSkeletonProps>("VProductCardSkeleton", "product");
export const VProfileSkeleton = /*#__PURE__*/ createPreset<VProfileSkeletonProps>("VProfileSkeleton", "profile");
export const VTableSkeleton = /*#__PURE__*/ createPreset<VTableSkeletonProps>("VTableSkeleton", "table");


export type VAutoSkeletonProps = VSkeletonSwitchProps;

export const VAutoSkeleton = /*#__PURE__*/ defineComponent({
  name: "VAutoSkeleton",
  inheritAttrs: false,
  props: [
    "loading", "pattern", "rows", "columns", "color", "highlightColor", "animated", "label",
    "mediaHeight", "avatarSize", "showMedia", "showAvatar", "showHeader", "showChart", "showStats",
    "showSubmit", "showRating", "showPrice", "showCta",
  ],
  setup(props, { attrs, slots }) {
    return () => h(VSkeletonSwitch, { ...attrs, ...props }, slots);
  },
}) as DefineComponent<VAutoSkeletonProps>;
