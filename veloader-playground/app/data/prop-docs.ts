import type { Component } from "vue";
import {
  VLoader,
  VLoading,
  VLoadingButton,
  VPatternSkeleton,
  VProgress,
  VSkeleton,
  VSkeletonGroup,
  VSkeletonSwitch,
  VSpinner,
} from "veloader";
import { loaderVariants, skeletonPatterns } from "./catalog";
import { formatDefaultValue, readRuntimeProps } from "../utils/props";

export interface PropDoc {
  /** Prop name. */
  name: string;
  /** TypeScript type of the prop. */
  type: string;
  /** Documented default value. */
  default: string;
  /** Whether the prop is required. */
  required: boolean;
  /** What the prop does. */
  description: string;
}

export interface SlotDoc {
  /** Slot name. */
  name: string;
  /** What the slot is used for. */
  description: string;
}

export interface PropDefinition {
  type: string;
  description: string;
  /** Overrides the runtime default when the documentation is more precise. */
  default?: string;
}

const loaderVariantUnion = loaderVariants
  .map((variant) => `"${variant}"`)
  .join(" | ");

const skeletonPatternUnion = skeletonPatterns
  .map((entry) => `"${entry.pattern}"`)
  .join(" | ");

const loaderPropDefinitions: Record<string, PropDefinition> = {
  variant: {
    type: loaderVariantUnion,
    description:
      "Selects the treatment rendered by the component. Unknown values fall back to `spin`.",
  },
  color: {
    type: "string",
    description:
      "Primary colour of the loader. Accepts any CSS colour value, including `currentColor`.",
  },
  size: {
    type: "number",
    description:
      "Diameter or height of the loader in pixels. Values below 12 are clamped to 12.",
  },
  duration: {
    type: "number",
    description:
      "Duration of one animation cycle in milliseconds. Values below 100 are clamped to 100.",
  },
  label: {
    type: "string",
    description:
      "Accessible name announced by the status region. An empty label makes the loader decorative.",
  },
  decorative: {
    type: "boolean",
    description:
      "Hides the loader from assistive technology. Use it when an ancestor already announces the loading state.",
  },
  count: {
    type: "number",
    description:
      "Number of marks rendered by treatments that repeat an element. Clamped to 1–12.",
  },
  value: {
    type: "number | null",
    description:
      "Completion percentage between 0 and 100. Only the progress ring renders the value.",
  },
};

const skeletonAppearanceDefinitions: Record<string, PropDefinition> = {
  color: {
    type: "string",
    description:
      "Base colour of the placeholder blocks. Falls back to `--v-skeleton-base-color`.",
  },
  highlightColor: {
    type: "string",
    description:
      "Colour of the shimmer highlight. Falls back to `--v-skeleton-highlight-color`.",
  },
  animated: {
    type: "boolean",
    description:
      "Enables the shimmer animation. Reduced-motion preferences always disable it.",
  },
  label: {
    type: "string",
    description:
      "Accessible name announced by the status region. Without a label the skeleton stays hidden from assistive technology.",
  },
};

export const patternPropDefinitions: Record<string, PropDefinition> = {
  ...skeletonAppearanceDefinitions,
  pattern: {
    type: skeletonPatternUnion,
    description: "Layout pattern rendered by the component.",
  },
  rows: {
    type: "number",
    description:
      "Number of repeated text lines, list items, fields or data rows. Clamped to 1–12. Table and dashboard headers are separate; dashboard always includes one fixed header.",
  },
  columns: {
    type: "number",
    description:
      "Number of columns in table and dashboard layouts. Clamped to 1–6.",
  },
  mediaHeight: {
    type: "number | string",
    description:
      "Height of the media block in pixels or any CSS length.",
  },
  avatarSize: {
    type: "number",
    description: "Diameter of the avatar block in pixels. Clamped to 1–160.",
  },
  showMedia: {
    type: "boolean",
    description: "Toggles the media block where the pattern supports one.",
  },
  showAvatar: {
    type: "boolean",
    description: "Toggles the avatar block where the pattern supports one.",
  },
  showHeader: {
    type: "boolean",
    description: "Toggles the table header row.",
  },
  showChart: {
    type: "boolean",
    description: "Toggles the dashboard chart block.",
  },
  showStats: {
    type: "boolean",
    description: "Toggles the statistic tiles used by profile and dashboard patterns.",
  },
  showSubmit: {
    type: "boolean",
    description: "Toggles the submit block used by the form pattern.",
  },
  showRating: {
    type: "boolean",
    description: "Toggles the rating block used by the product pattern.",
  },
  showPrice: {
    type: "boolean",
    description: "Toggles the price block used by the product pattern.",
  },
  showCta: {
    type: "boolean",
    description:
      "Toggles the call-to-action block used by the product pattern.",
  },
};

/**
 * Builds the prop table of a component from its runtime declaration.
 *
 * Only props that the component really declares are documented, and the
 * declared defaults are read from the package itself, so the table can never
 * drift away from the shipped behaviour.
 */
export function buildPropDocs(
  component: Component,
  definitions: Record<string, PropDefinition>,
  order: readonly string[],
  defaultOverrides: Record<string, string> = {},
): PropDoc[] {
  const runtimeProps = readRuntimeProps(component);
  const runtimeByName = new Map(runtimeProps.map((prop) => [prop.name, prop]));

  return order
    .filter((name) => runtimeByName.has(name))
    .map((name) => {
      const runtime = runtimeByName.get(name)!;
      const definition = definitions[name];
      const override = defaultOverrides[name];

      return {
        name,
        type: definition?.type ?? runtime.runtimeType ?? "unknown",
        default:
          override ??
          (runtime.hasDefault
            ? formatDefaultValue(runtime.defaultValue)
            : "—"),
        required: runtime.required,
        description: definition?.description ?? "",
      };
    });
}

/** Props shared by every named loader. */
export const namedLoaderPropOrder = [
  "color",
  "size",
  "duration",
  "count",
  "label",
  "decorative",
] as const;

/** Props of the generic `VLoader` component. */
export const loaderPropOrder = [
  "variant",
  "color",
  "size",
  "duration",
  "count",
  "label",
  "decorative",
  "value",
] as const;

export function buildLoaderPropDocs(options: {
  variant?: string;
  defaultMarks?: number;
  supportsValue?: boolean;
  repeatCount?: boolean;
}): PropDoc[] {
  const order = [
    ...namedLoaderPropOrder,
    ...(options.supportsValue ? (["value"] as const) : []),
  ];

  return buildPropDocs(
    VLoader,
    options.repeatCount === false
      ? { ...loaderPropDefinitions, count: { type: "number", description: "Accepted by the shared API, but ignored by this fixed treatment. No count control is shown." } }
      : loaderPropDefinitions,
    order,
    options.defaultMarks === undefined
      ? {}
      : { count: String(options.defaultMarks) },
  );
}

export function buildGenericLoaderPropDocs(): PropDoc[] {
  return buildPropDocs(
    VLoader,
    loaderPropDefinitions,
    loaderPropOrder,
    {
      count: "4 (9 for heatmap/squares; 2 fixed for breathing/dual-arc)",
    },
  );
}

/**
 * Defaults that the component applies internally and therefore does not
 * declare as a runtime default.
 */
const skeletonDefaultOverrides: Record<string, string> = {
  avatarSize: "48",
};

/** Props of the `VPatternSkeleton` component. */
export function buildPatternPropDocs(): PropDoc[] {
  return buildPropDocs(
    VPatternSkeleton,
    patternPropDefinitions,
    [
      "pattern",
      "rows",
      "columns",
      "mediaHeight",
      "avatarSize",
      "color",
      "highlightColor",
      "animated",
      "label",
      "showMedia",
      "showAvatar",
      "showHeader",
      "showChart",
      "showStats",
      "showSubmit",
      "showRating",
      "showPrice",
      "showCta",
    ],
    skeletonDefaultOverrides,
  );
}

export function buildSkeletonPropDocs(): PropDoc[] {
  return buildPropDocs(
    VSkeleton,
    {
      variant: {
        type: '"text" | "rect" | "circle"',
        description: "Shape of the placeholder. Unknown values fall back to `text`.",
      },
      width: {
        type: "number | string",
        description:
          "Width as a pixel number or any CSS length. Defaults to `100%`, or `40px` for circles.",
      },
      height: {
        type: "number | string",
        description:
          "Height as a pixel number or any CSS length. Defaults to `1em` for text and `6rem` for rectangles.",
      },
      borderRadius: {
        type: "number | string",
        description:
          "Border radius as a pixel number or any CSS length. A shape appropriate default is used when omitted.",
      },
      animated: {
        type: "boolean",
        description:
          "Enables the shimmer animation. Reduced-motion preferences always disable it.",
      },
      label: {
        type: "string",
        description:
          "Accessible name announced by the status region. Without a label the skeleton is decorative.",
      },
    },
    ["variant", "width", "height", "borderRadius", "animated", "label"],
  );
}

export function buildSkeletonGroupPropDocs(): PropDoc[] {
  return buildPropDocs(
    VSkeletonGroup,
    {
      label: {
        type: "string",
        description:
          "Accessible name announced by the group. Without a label the group does not create a status region.",
      },
      gap: {
        type: "string",
        description: "CSS gap between the child placeholders.",
      },
      decorative: {
        type: "boolean",
        description: "Hides the whole group from assistive technology.",
      },
    },
    ["label", "gap", "decorative"],
  );
}

export function buildSkeletonSwitchPropDocs(): PropDoc[] {
  return buildPropDocs(
    VSkeletonSwitch,
    {
      loading: {
        type: "boolean",
        description:
          "Renders the skeleton while `true` and the default slot afterwards.",
      },
      ...patternPropDefinitions,
    },
    [
      "loading",
      "pattern",
      "rows",
      "columns",
      "mediaHeight",
      "avatarSize",
      "color",
      "highlightColor",
      "animated",
      "label",
      "showMedia",
      "showAvatar",
      "showHeader",
      "showChart",
      "showStats",
      "showSubmit",
      "showRating",
      "showPrice",
      "showCta",
    ],
    skeletonDefaultOverrides,
  );
}

export function buildSpinnerPropDocs(): PropDoc[] {
  return buildPropDocs(
    VSpinner,
    {
      size: {
        type: "number",
        description:
          "Diameter of the spinner in pixels. Negative and non-finite values are normalised.",
      },
      color: {
        type: "string",
        description:
          "Accent colour of the active edge. The track uses `--v-spinner-track-color`.",
      },
      label: {
        type: "string",
        description:
          "Accessible name announced by the status region. An empty label makes the spinner decorative.",
      },
      decorative: {
        type: "boolean",
        description:
          "Hides the spinner from assistive technology. Use it when an ancestor already announces the loading state.",
      },
    },
    ["size", "color", "label", "decorative"],
  );
}

export function buildProgressPropDocs(): PropDoc[] {
  return buildPropDocs(
    VProgress,
    {
      value: {
        type: "number | null",
        description:
          "Current value. Omit it, pass `null`, or pass a non-finite value for an indeterminate bar.",
      },
      min: {
        type: "number",
        description: "Lower bound of the value range.",
      },
      max: {
        type: "number",
        description:
          "Upper bound of the value range. When `max` is not greater than `min` the bar is indeterminate.",
      },
      label: {
        type: "string",
        description: "Accessible name of the progress bar.",
      },
      valueText: {
        type: "string",
        description:
          "Human readable value exposed through `aria-valuetext`. Only used while determinate.",
      },
      height: {
        type: "number | string",
        description: "Thickness of the bar in pixels or any CSS length.",
      },
      color: {
        type: "string",
        description: "Colour of the filled portion. Overrides `--v-progress-color`.",
      },
      trackColor: {
        type: "string",
        description: "Colour of the unfilled track. Overrides `--v-progress-track-color`.",
      },
    },
    [
      "value",
      "min",
      "max",
      "label",
      "valueText",
      "height",
      "color",
      "trackColor",
    ],
  );
}

export function buildLoadingPropDocs(): PropDoc[] {
  return buildPropDocs(
    VLoading,
    {
      loading: {
        type: "boolean",
        description:
          "Shows the overlay, sets `aria-busy` on the wrapper and makes the content inert.",
      },
      label: {
        type: "string",
        description:
          "Loading message. It is visually hidden and announced by the status region.",
      },
      inertContent: {
        type: "boolean",
        description:
          "Makes the wrapped content inert while the overlay is active.",
      },
      indicatorSize: {
        type: "number",
        description: "Diameter of the built-in spinner in pixels.",
      },
    },
    ["loading", "label", "inertContent", "indicatorSize"],
  );
}

export function buildLoadingButtonPropDocs(): PropDoc[] {
  return buildPropDocs(
    VLoadingButton,
    {
      loading: {
        type: "boolean",
        description:
          "Disables the button, sets `aria-busy` and shows the indicator.",
      },
      disabled: {
        type: "boolean",
        description:
          "Native disabled state. The button is also disabled while loading.",
      },
      type: {
        type: '"button" | "submit" | "reset"',
        description:
          "Native button type. The safe default avoids accidental form submission.",
      },
      indicatorSize: {
        type: "number",
        description: "Diameter of the default indicator in pixels.",
      },
    },
    ["loading", "disabled", "type", "indicatorSize"],
  );
}

export const loadingSlots: SlotDoc[] = [
  { name: "default", description: "The content being loaded." },
  { name: "indicator", description: "Replaces the built-in spinner." },
];

export const loadingButtonSlots: SlotDoc[] = [
  {
    name: "default",
    description:
      "Button label. It stays in the accessibility tree and keeps its space while loading.",
  },
  { name: "indicator", description: "Replaces the built-in spinner." },
];

export const skeletonSwitchSlots: SlotDoc[] = [
  { name: "default", description: "The loaded content." },
  {
    name: "skeleton",
    description:
      "Custom placeholder shown while `loading` is `true`. Defaults to the selected pattern.",
  },
];
