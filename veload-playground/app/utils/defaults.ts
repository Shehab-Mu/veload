import type { Component } from "vue";
import { VLoader, VPatternSkeleton } from "veload";
import { readRuntimeProps } from "./props";


export function runtimeDefaults(component: Component): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  for (const prop of readRuntimeProps(component)) {
    if (prop.hasDefault) {
      defaults[prop.name] = prop.defaultValue;
    }
  }

  return defaults;
}

// `count` varies by treatment and is supplied by the catalog.
export function loaderDefaults(defaultMarks: number): Record<string, unknown> {
  return { ...runtimeDefaults(VLoader), count: defaultMarks };
}

// The component normalises `avatarSize` internally without declaring a default.
export function skeletonDefaults(): Record<string, unknown> {
  return { ...runtimeDefaults(VPatternSkeleton), avatarSize: 48 };
}
