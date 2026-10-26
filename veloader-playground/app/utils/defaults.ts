import type { Component } from "vue";
import { VLoader, VPatternSkeleton } from "veload";
import { readRuntimeProps } from "./props";

/**
 * Reads the declared defaults of a component from the package itself.
 */
export function runtimeDefaults(component: Component): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  for (const prop of readRuntimeProps(component)) {
    if (prop.hasDefault) {
      defaults[prop.name] = prop.defaultValue;
    }
  }

  return defaults;
}

/**
 * Defaults of the named loaders.
 *
 * `count` has no declared default because the amount of marks depends on the
 * treatment, so the catalog supplies it.
 */
export function loaderDefaults(defaultMarks: number): Record<string, unknown> {
  return { ...runtimeDefaults(VLoader), count: defaultMarks };
}

/**
 * Defaults of the skeleton patterns.
 *
 * `avatarSize` has no declared default because the component normalises it
 * internally, so the effective default is added here.
 */
export function skeletonDefaults(): Record<string, unknown> {
  return { ...runtimeDefaults(VPatternSkeleton), avatarSize: 48 };
}
