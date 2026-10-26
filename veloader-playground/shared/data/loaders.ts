import type { LoaderVariant } from "veload";

export type LoaderCategory = "Motion" | "Circular" | "Geometric" | "Utility";

/**
 * Metadata of a named loader.
 *
 * The data is free of Vue imports so it can be shared by the application and
 * by the server routes that build the sitemap.
 */
export interface LoaderMeta {
  /** Stable URL segment, for example `card-flip`. */
  slug: string;
  /** Exported component name, for example `VCardFlipLoader`. */
  name: string;
  /** Human readable title. */
  title: string;
  /** Variant handled by the underlying `VLoader` component. */
  variant: LoaderVariant;
  /** Grouping used by the collection filters. */
  category: LoaderCategory;
  /** One line summary shown on cards and in the collection grid. */
  description: string;
  /** Short notes describing the treatment. */
  highlights: string[];
  /** Number of marks the loader renders with its default `count`. */
  defaultMarks: number;
  /** Whether the treatment visibly repeats one or more marks. */
  repeatCount: boolean;
  /** Whether the loader renders a determinate value. */
  supportsValue: boolean;
  /** Whether the loader is part of the curated homepage selection. */
  featured: boolean;
}

/**
 * Treatments that visibly repeat one or more marks, so the `count` prop
 * changes what the user sees.
 */
const repeatingSlugs = new Set([
  "bars",
  "bounce",
  "dot-sweep",
  "dots",
  "equalizer",
  "grid",
  "heatmap",
  "orbit-dots",
  "sliding-bars",
  "spin-dots",
  "squares",
  "stair",
  "typing",
  "wave",
]);

type LoaderMetaInput = Omit<LoaderMeta, "repeatCount">;

const loaderMeta: LoaderMetaInput[] = [
  {
    slug: "bars",
    name: "VBarsLoader",
    title: "Bars",
    variant: "bars",
    category: "Motion",
    description: "Rhythmic vertical bars",
    highlights: [
      "Four rounded bars scale in and out with a staggered offset.",
      "Reads as a media equaliser, ideal for audio or list processing.",
      "Uses the `count` prop to change the number of bars.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: true,
  },
  {
    slug: "bounce",
    name: "VBounceLoader",
    title: "Bounce",
    variant: "bounce",
    category: "Motion",
    description: "Playful bouncing dots",
    highlights: [
      "Four dots bounce with a soft shadow beneath each mark.",
      "A friendly, low-key indicator for actions the user just triggered.",
      "Shorter durations make the bounce feel more energetic.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "dots",
    name: "VDotsLoader",
    title: "Dots",
    variant: "dots",
    category: "Motion",
    description: "Minimal staggered dots",
    highlights: [
      "Four dots rise and fade in sequence with an easing curve.",
      "The smallest, calmest treatment in the collection.",
      "Works well next to text, for example inside a table cell.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: true,
  },
  {
    slug: "dot-sweep",
    name: "VDotSweepLoader",
    title: "Dot sweep",
    variant: "dot-sweep",
    category: "Motion",
    description: "Horizontal dot handoff",
    highlights: [
      "Four dots trade brightness as they glide horizontally, without bouncing.",
      "Useful for inline search, autocomplete and compact toolbar requests.",
      "Use `count` for 1–12 dots; the row grows to leave room for their travel.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "equalizer",
    name: "VEqualizerLoader",
    title: "Equalizer",
    variant: "equalizer",
    category: "Motion",
    description: "Audio-style equalizer",
    highlights: [
      "Square bars stretch and contract like an audio visualiser.",
      "Sharp corners make it a good companion for dense toolbars.",
      "Pair with a darker colour for a stronger silhouette.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "sliding-bars",
    name: "VSlidingBarsLoader",
    title: "Sliding bars",
    variant: "sliding-bars",
    category: "Motion",
    description: "Interleaved horizontal sliding bars",
    highlights: [
      "Four horizontal bars slide side to side in alternating phases.",
      "A good fit for batch processing, data panels and queued work.",
      "Use `count` for 1–12 bars; the stack grows vertically to fit every row.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "spin",
    name: "VSpinLoader",
    title: "Spin",
    variant: "spin",
    category: "Motion",
    description: "Compact spinner",
    highlights: [
      "A single arc rotates around a soft track.",
      "The default treatment of `VLoader` and the safest neutral choice.",
      "Scales cleanly from 16px icons to large empty states.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: true,
  },
  {
    slug: "spin-dots",
    name: "VSpinDotsLoader",
    title: "Spin dots",
    variant: "spin-dots",
    category: "Motion",
    description: "Stepped radial dots",
    highlights: [
      "Dots orbit in a stepped, mechanical rotation.",
      "Feels technical, which suits developer tools and terminals.",
      "The stepped timing keeps the motion crisp rather than floaty.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "typing",
    name: "VTypingLoader",
    title: "Typing",
    variant: "typing",
    category: "Motion",
    description: "Conversation typing cue",
    highlights: [
      "Four dots shrink in sequence to mimic a typing indicator.",
      "Best suited to chat, comment and assistant interfaces.",
      "Use the `count` prop to adjust the number of dots.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "wave",
    name: "VWaveLoader",
    title: "Wave",
    variant: "wave",
    category: "Motion",
    description: "Soft travelling wave",
    highlights: [
      "Small bars travel through the group in a wave.",
      "Calm and horizontal, so it never disturbs the reading flow.",
      "A good default for long, uninteruptible loads.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "breathing",
    name: "VBreathingLoader",
    title: "Breathing",
    variant: "breathing",
    category: "Circular",
    description: "Steady centre with a breathing outlined halo",
    highlights: [
      "A stationary centre dot anchors a softly expanding outlined halo, unlike a solid pulse.",
      "A quiet fit for background refresh, session recovery and connection checks.",
      "The centre and halo form two fixed marks; `count` is ignored.",
    ],
    defaultMarks: 2,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "dual-arc",
    name: "VDualArcLoader",
    title: "Dual arc",
    variant: "dual-arc",
    category: "Circular",
    description: "Counterrotating concentric arcs",
    highlights: [
      "Two concentric open arcs turn in opposite directions at different speeds.",
      "A compact indicator for parallel work such as syncing files and fetching data.",
      "The fixed pair of arcs is indeterminate; `count` is ignored.",
    ],
    defaultMarks: 2,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "gradient-ring",
    name: "VGradientRingLoader",
    title: "Gradient ring",
    variant: "gradient-ring",
    category: "Circular",
    description: "Luminous conic ring",
    highlights: [
      "A conic gradient sweeps around a masked ring.",
      "Premium look without gradients baked into the markup.",
      "Rendered with `currentColor`, so it inherits the accent colour.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: true,
  },
  {
    slug: "orbit",
    name: "VOrbitLoader",
    title: "Orbit",
    variant: "orbit",
    category: "Circular",
    description: "Single orbital body",
    highlights: [
      "One satellite circles a faint orbit ring.",
      "Communicates background progress without claiming a percentage.",
      "The orbit path is drawn from the loader colour itself.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "orbit-dots",
    name: "VOrbitDotsLoader",
    title: "Orbit dots",
    variant: "orbit-dots",
    category: "Circular",
    description: "Orbiting satellite dots",
    highlights: [
      "Several dots orbit the centre with a fading trail.",
      "Adds depth while staying readable at small sizes.",
      "Dot count and opacity follow the `count` prop.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: true,
  },
  {
    slug: "progress-ring",
    name: "VProgressRingLoader",
    title: "Progress ring",
    variant: "progress-ring",
    category: "Circular",
    description: "Progress-ready ring",
    highlights: [
      "The only loader that can show a determinate percentage.",
      "Pass `value` between 0 and 100 to render the completion arc and label.",
      "Without a value it animates as an indeterminate ring.",
    ],
    defaultMarks: 4,
    supportsValue: true,
    featured: true,
  },
  {
    slug: "pulse",
    name: "VPulseLoader",
    title: "Pulse",
    variant: "pulse",
    category: "Circular",
    description: "Solid focal pulse",
    highlights: [
      "A solid disc scales and fades in and out.",
      "Perfect for a single, very fast operation.",
      "Uses opacity and scale so it stays crisp on any background.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "ring",
    name: "VRingLoader",
    title: "Ring",
    variant: "ring",
    category: "Circular",
    description: "Classic open ring",
    highlights: [
      "A single arc sweeps around a full circle.",
      "Runs slightly slower than `spin` for a softer impression.",
      "Uses an eased curve instead of a linear rotation.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "ripple",
    name: "VRippleLoader",
    title: "Ripple",
    variant: "ripple",
    category: "Circular",
    description: "Expanding ripple",
    highlights: [
      "Concentric rings expand outwards from the centre.",
      "Evokes a touch or signal reaching a surface.",
      "Reduced-motion preferences hide the expanding rings entirely.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "rotate",
    name: "VRotateLoader",
    title: "Rotate",
    variant: "rotate",
    category: "Circular",
    description: "Organic rotating ring",
    highlights: [
      "A blob-shaped ring rotates with an organic outline.",
      "Softer and more expressive than the geometric rings.",
      "The shape morphs slightly while it turns.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "signal",
    name: "VSignalLoader",
    title: "Signal",
    variant: "signal",
    category: "Circular",
    description: "Signal-strength arc",
    highlights: [
      "A quarter arc pulses like a connection indicator.",
      "A natural fit for network, sync and streaming states.",
      "Two borders stay transparent to form the open corner.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "snake",
    name: "VSnakeLoader",
    title: "Snake",
    variant: "snake",
    category: "Circular",
    description: "Chasing circular stroke",
    highlights: [
      "A two-sided stroke chases itself around the circle.",
      "Distinct at small sizes because of the thick leading edge.",
      "Uses `currentColor`, so it inherits the surrounding text colour.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "blob",
    name: "VBlobLoader",
    title: "Blob",
    variant: "blob",
    category: "Geometric",
    description: "Morphing organic blob",
    highlights: [
      "A soft blob morphs and rotates continuously.",
      "Adds a playful, organic note to a technical interface.",
      "Runs at 1.8× the base duration for an unhurried feel.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: true,
  },
  {
    slug: "card-flip",
    name: "VCardFlipLoader",
    title: "Card flip",
    variant: "card-flip",
    category: "Geometric",
    description: "Dimensional card flip",
    highlights: [
      "A rounded square flips in three dimensions.",
      "Adds depth without images or extra markup.",
      "Uses a perspective curve so the flip feels physical.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "element",
    name: "VElementLoader",
    title: "Element",
    variant: "element",
    category: "Geometric",
    description: "Rotating diamond",
    highlights: [
      "A rounded square rotates around its own axis.",
      "Familiar from media applications and record buttons.",
      "The shape changes as it turns for a kinetic edge.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "flow",
    name: "VFlowLoader",
    title: "Flow",
    variant: "flow",
    category: "Geometric",
    description: "Continuous horizontal flow",
    highlights: [
      "A horizontal bar fills from left to right and loops.",
      "Reads as a progress track rather than a spinner.",
      "Works well in narrow rows, toolbars and cards.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "grid",
    name: "VGridLoader",
    title: "Grid",
    variant: "grid",
    category: "Geometric",
    description: "Pulsing tile grid",
    highlights: [
      "Four tiles pulse in sequence inside a 2 × 2 grid.",
      "A neutral placeholder that matches skeleton layouts.",
      "Increase `count` for larger grids.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "hashtag",
    name: "VHashtagLoader",
    title: "Hashtag",
    variant: "hashtag",
    category: "Geometric",
    description: "Bold hashtag mark",
    highlights: [
      "Two crossing bars form a hashtag shape.",
      "Uses pseudo-elements, so it adds no extra markup.",
      "A distinctive brand-friendly mark for social surfaces.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "heatmap",
    name: "VHeatmapLoader",
    title: "Heatmap",
    variant: "heatmap",
    category: "Geometric",
    description: "Data-grid shimmer",
    highlights: [
      "Nine tiles shimmer like a loading heatmap.",
      "Mirrors the density of data-heavy interfaces.",
      "Renders nine marks by default.",
    ],
    defaultMarks: 9,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "liquid",
    name: "VLiquidLoader",
    title: "Liquid",
    variant: "liquid",
    category: "Geometric",
    description: "Rising liquid fill",
    highlights: [
      "A liquid shape sloshes inside a circular container.",
      "Suggests a fill level rather than a rotation.",
      "The inner shape is clipped by the container radius.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "logo-spin",
    name: "VLogoSpinLoader",
    title: "Logo spin",
    variant: "logo-spin",
    category: "Geometric",
    description: "Brand-neutral mark spin",
    highlights: [
      "A diamond mark spins with an alternating curve.",
      "Designed to sit next to a wordmark without competing with it.",
      "The mark is drawn entirely with CSS.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "morph",
    name: "VMorphLoader",
    title: "Morph",
    variant: "morph",
    category: "Geometric",
    description: "Morphing soft square",
    highlights: [
      "A rounded square morphs between four shapes.",
      "Soft geometry that works on any surface colour.",
      "A flexible middle ground between rings and blobs.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: true,
  },
  {
    slug: "plane",
    name: "VPlaneLoader",
    title: "Plane",
    variant: "plane",
    category: "Geometric",
    description: "Gliding paper plane",
    highlights: [
      "A clipped triangle glides up and down.",
      "Suggests sending, syncing or navigation.",
      "Uses `clip-path`, so the shape stays sharp at any size.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "squares",
    name: "VSquaresLoader",
    title: "Squares",
    variant: "squares",
    category: "Geometric",
    description: "Rotating square matrix",
    highlights: [
      "Nine squares rotate in a 3 × 3 matrix.",
      "Dense but tidy, so it still fits inside a small card.",
      "Renders nine marks by default.",
    ],
    defaultMarks: 9,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "stair",
    name: "VStairLoader",
    title: "Stair",
    variant: "stair",
    category: "Geometric",
    description: "Ascending motion bars",
    highlights: [
      "Bars grow from short to tall like a staircase.",
      "Suggests progress that moves forward.",
      "Each bar keeps a slightly different height.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
  {
    slug: "fallback",
    name: "VFallbackLoader",
    title: "Fallback",
    variant: "fallback",
    category: "Utility",
    description: "Resilient dashed fallback",
    highlights: [
      "A dashed circle rotates slowly.",
      "Reads as a deliberate fallback rather than a missing asset.",
      "Useful when a rich loader cannot be shown.",
    ],
    defaultMarks: 4,
    supportsValue: false,
    featured: false,
  },
];

export const loaders: LoaderMeta[] = loaderMeta.map((entry) => ({
  ...entry,
  repeatCount: repeatingSlugs.has(entry.slug),
}));

export const loaderCategories: LoaderCategory[] = [
  "Motion",
  "Circular",
  "Geometric",
  "Utility",
];

export const loaderVariants: LoaderVariant[] = loaders.map(
  (entry) => entry.variant,
);

export const featuredLoaders: LoaderMeta[] = loaders.filter(
  (entry) => entry.featured,
);

export function findLoader(slug: string): LoaderMeta | undefined {
  return loaders.find((entry) => entry.slug === slug);
}
