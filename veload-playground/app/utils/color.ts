/**
 * Helpers that keep a native colour picker and a free text colour input in
 * sync.
 *
 * A native `<input type="color">` can only represent an opaque hexadecimal
 * colour, while the skeleton colours accept any CSS colour, including values
 * with an alpha channel. The text input therefore always holds the
 * authoritative value, and the picker follows it only when the value can be
 * represented without loss.
 */


export const DEFAULT_BASE_COLOR = "#94a3b8";


export const DEFAULT_HIGHLIGHT_COLOR = "#ffffff";

export interface PickerColor {

  hex: string;

  hasAlpha: boolean;
}

const HEX_PATTERN = /^#([0-9a-f]{3,8})$/i;
const RGB_PATTERN = /^rgba?\(([^)]*)\)$/i;

function clampChannel(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(255, Math.max(0, Math.round(value)));
}

function toHexPair(value: number): string {
  return clampChannel(value).toString(16).padStart(2, "0");
}

function parseChannel(raw: string): number | null {
  const trimmed = raw.trim();

  if (trimmed.endsWith("%")) {
    const percent = Number.parseFloat(trimmed);
    return Number.isFinite(percent) ? (percent / 100) * 255 : null;
  }

  const value = Number.parseFloat(trimmed);
  return Number.isFinite(value) ? value : null;
}

function parseAlpha(raw: string | undefined): number | null {
  if (raw === undefined) {
    return null;
  }

  const trimmed = raw.trim();

  if (trimmed.endsWith("%")) {
    const percent = Number.parseFloat(trimmed);
    return Number.isFinite(percent) ? percent / 100 : null;
  }

  const alpha = Number.parseFloat(trimmed);
  return Number.isFinite(alpha) ? alpha : null;
}

function expandHex(digits: string): string {
  const [r = "", g = "", b = ""] = digits;
  return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
}

/**
 * Converts a CSS colour into the opaque hexadecimal colour a native picker
 * can display.
 *
 * Returns `null` when the value is not a hexadecimal or `rgb()`/`rgba()`
 * colour, for example a named colour, `hsl()` or an invalid value. Such
 * values are preserved untouched in the text input and in the preview.
 */
export function toPickerColor(value: string): PickerColor | null {
  const trimmed = value.trim();

  const hexMatch = trimmed.match(HEX_PATTERN);

  if (hexMatch) {
    const digits = hexMatch[1] ?? "";

    if (digits.length === 3) {
      return { hex: expandHex(digits), hasAlpha: false };
    }

    if (digits.length === 4) {
      const alphaDigit = digits[3] ?? "f";
      const alpha = parseInt(alphaDigit + alphaDigit, 16) / 255;
      return { hex: expandHex(digits.slice(0, 3)), hasAlpha: alpha < 1 };
    }

    if (digits.length === 6) {
      return { hex: trimmed.toLowerCase(), hasAlpha: false };
    }

    if (digits.length === 8) {
      const alpha = parseInt(digits.slice(6, 8), 16) / 255;
      return { hex: `#${digits.slice(0, 6)}`.toLowerCase(), hasAlpha: alpha < 1 };
    }

    return null;
  }

  const rgbMatch = trimmed.match(RGB_PATTERN);

  if (rgbMatch) {
    const parts = (rgbMatch[1] ?? "")
      .replace("/", " ")
      .split(/[\s,]+/)
      .filter((part) => part.length > 0);

    if (parts.length >= 3) {
      const red = parseChannel(parts[0] ?? "");
      const green = parseChannel(parts[1] ?? "");
      const blue = parseChannel(parts[2] ?? "");

      if (red !== null && green !== null && blue !== null) {
        const alpha = parts.length > 3 ? parseAlpha(parts[3]) : null;

        return {
          hex: `#${toHexPair(red)}${toHexPair(green)}${toHexPair(blue)}`,
          hasAlpha: alpha !== null && alpha < 1,
        };
      }
    }
  }

  return null;
}


export function isPickerRepresentable(value: string): boolean {
  const parsed = toPickerColor(value);
  return parsed !== null && !parsed.hasAlpha;
}
