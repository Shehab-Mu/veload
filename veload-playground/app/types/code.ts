/**
 * Shared types for the documentation components.
 */

export interface CodeTab {
  /** Stable identifier used for the tab and panel ids. */
  id: string;
  /** Visible tab label. */
  label: string;
  /** Source code shown in the tab. */
  code: string;
  /** Language used for the syntax highlighting. */
  language?: "vue" | "ts" | "bash" | "text";
}
