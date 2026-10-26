import type { Component } from "vue";

/**
 * Runtime information about a single declared prop.
 *
 * The values are read from the component definition itself, so the
 * documentation never drifts from the shipped package.
 */
export interface RuntimePropInfo {
  /** Prop name as declared by the component. */
  name: string;
  /** Whether the prop was declared as required. */
  required: boolean;
  /** Whether the component declares a default value for the prop. */
  hasDefault: boolean;
  /** The declared default value, when there is one. */
  defaultValue: unknown;
  /** Constructor name of the declared type, when it can be determined. */
  runtimeType: string | null;
}

function constructorName(value: unknown): string | null {
  if (typeof value === "function") {
    return (value as { name?: string }).name ?? null;
  }

  if (Array.isArray(value)) {
    const names = value
      .map((entry) => constructorName(entry))
      .filter((name): name is string => typeof name === "string");

    return names.length > 0 ? names.join(" | ") : null;
  }

  return null;
}

/**
 * Reads the props a component declares at runtime.
 *
 * Components that only forward attributes (the named loaders and the named
 * skeleton presets) do not declare props themselves; their props are
 * documented through the base component they wrap.
 */
export function readRuntimeProps(component: Component): RuntimePropInfo[] {
  const raw = (component as unknown as { props?: unknown }).props;

  if (!raw) {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw
      .filter((entry): entry is string => typeof entry === "string")
      .map((name) => ({
        name,
        required: false,
        hasDefault: false,
        defaultValue: undefined,
        runtimeType: null,
      }));
  }

  if (typeof raw !== "object") {
    return [];
  }

  return Object.entries(raw as Record<string, unknown>).map(([name, value]) => {
    if (value && typeof value === "object") {
      const options = value as {
        type?: unknown;
        required?: boolean;
        default?: unknown;
      };
      const hasDefault = "default" in options;

      return {
        name,
        required: options.required === true,
        hasDefault,
        defaultValue: hasDefault ? options.default : undefined,
        runtimeType: constructorName(options.type),
      };
    }

    return {
      name,
      required: false,
      hasDefault: false,
      defaultValue: undefined,
      runtimeType: constructorName(value),
    };
  });
}

/**
 * Formats a default value the way it is written in the documentation.
 */
export function formatDefaultValue(value: unknown): string {
  if (value === undefined) {
    return "—";
  }

  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "—";
}
