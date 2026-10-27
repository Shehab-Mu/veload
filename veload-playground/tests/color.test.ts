import { describe, expect, it } from "vitest";
import {
  DEFAULT_BASE_COLOR,
  DEFAULT_HIGHLIGHT_COLOR,
  isPickerRepresentable,
  toPickerColor,
} from "~/utils/color";

describe("colour picker synchronisation", () => {
  it("exposes the opaque equivalent of the library defaults", () => {
    expect(DEFAULT_BASE_COLOR).toBe("#94a3b8");
    expect(DEFAULT_HIGHLIGHT_COLOR).toBe("#ffffff");
  });

  it("reads an opaque hexadecimal colour", () => {
    expect(toPickerColor("#6d3ff2")).toEqual({ hex: "#6d3ff2", hasAlpha: false });
    expect(toPickerColor("#6D3FF2")).toEqual({ hex: "#6d3ff2", hasAlpha: false });
  });

  it("expands a short hexadecimal colour", () => {
    expect(toPickerColor("#abc")).toEqual({ hex: "#aabbcc", hasAlpha: false });
  });

  it("keeps the alpha of a four and eight digit hexadecimal colour", () => {
    expect(toPickerColor("#12345678")).toEqual({
      hex: "#123456",
      hasAlpha: true,
    });
    expect(toPickerColor("#1234")).toEqual({ hex: "#112233", hasAlpha: true });
  });

  it("reads an opaque rgb colour", () => {
    expect(toPickerColor("rgb(109, 63, 242)")).toEqual({
      hex: "#6d3ff2",
      hasAlpha: false,
    });
    expect(toPickerColor("rgb(109 63 242)")).toEqual({
      hex: "#6d3ff2",
      hasAlpha: false,
    });
  });

  it("keeps the alpha of an rgba colour", () => {
    expect(toPickerColor("rgba(148, 163, 184, 0.28)")).toEqual({
      hex: "#94a3b8",
      hasAlpha: true,
    });
    expect(toPickerColor("rgba(148, 163, 184, 0.8)")).toEqual({
      hex: "#94a3b8",
      hasAlpha: true,
    });
    expect(toPickerColor("rgb(148 163 184 / 0.5)")).toEqual({
      hex: "#94a3b8",
      hasAlpha: true,
    });
  });

  it("does not invent a value for colours it cannot read", () => {
    expect(toPickerColor("rebeccapurple")).toBeNull();
    expect(toPickerColor("hsl(210 40% 96%)")).toBeNull();
    expect(toPickerColor("not a colour")).toBeNull();
    expect(toPickerColor("")).toBeNull();
    expect(toPickerColor("var(--v-skeleton-base-color)")).toBeNull();
  });

  it("only reports values the picker can represent without loss", () => {
    expect(isPickerRepresentable("#6d3ff2")).toBe(true);
    expect(isPickerRepresentable("rgb(109, 63, 242)")).toBe(true);
    expect(isPickerRepresentable("rgba(148, 163, 184, 0.28)")).toBe(false);
    expect(isPickerRepresentable("rebeccapurple")).toBe(false);
    expect(isPickerRepresentable("")).toBe(false);
  });
});
