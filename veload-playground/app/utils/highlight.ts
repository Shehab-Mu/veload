/**
 * A very small, dependency free syntax highlighter.
 *
 * It is intentionally limited to the two languages the documentation uses:
 * Vue single file components and TypeScript. Every token is escaped before it
 * is wrapped in a span, so the produced HTML can never contain markup that
 * came from the source code.
 */

export type TokenType =
  | "plain"
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "type"
  | "tag"
  | "attribute"
  | "punctuation"
  | "interpolation";

export interface Token {
  type: TokenType;
  value: string;
}

interface Rule {
  type: TokenType;
  pattern: RegExp;
}

function sticky(pattern: RegExp): RegExp {
  return new RegExp(pattern.source, `${pattern.flags.replace(/[gy]/g, "")}y`);
}

const tsRules: Rule[] = [
  { type: "comment", pattern: sticky(/\/\/[^\n]*/) },
  { type: "comment", pattern: sticky(/\/\*[\s\S]*?\*\//) },
  { type: "string", pattern: sticky(/"(?:[^"\\\n]|\\.)*"/) },
  { type: "string", pattern: sticky(/'(?:[^'\\\n]|\\.)*'/) },
  { type: "string", pattern: sticky(/`(?:[^`\\]|\\.)*`/) },
  { type: "number", pattern: sticky(/\b\d+(?:\.\d+)?\b/) },
  {
    type: "keyword",
    pattern: sticky(
      /\b(?:as|async|await|const|default|export|extends|from|function|import|interface|let|new|null|of|readonly|return|type|undefined|true|false|void)\b/,
    ),
  },
  {
    type: "type",
    pattern: sticky(/\b(?:ComputedRef|Partial|Record|Ref|Readonly|Promise|boolean|never|number|string|unknown)\b/),
  },
];

const templateRules: Rule[] = [
  { type: "comment", pattern: sticky(/<!--[\s\S]*?-->/) },
  { type: "interpolation", pattern: sticky(/\{\{[\s\S]*?\}\}/) },
  { type: "tag", pattern: sticky(/<\/?[A-Za-z][\w.-]*/) },
  { type: "string", pattern: sticky(/"(?:[^"\\\n]|\\.)*"/) },
  { type: "string", pattern: sticky(/'(?:[^'\\\n]|\\.)*'/) },
  { type: "attribute", pattern: sticky(/[A-Za-z_:@][\w:.-]*(?==)/) },
  { type: "punctuation", pattern: sticky(/[<>/=]/g) },
];

const styleRules: Rule[] = [
  { type: "comment", pattern: sticky(/\/\*[\s\S]*?\*\//) },
  { type: "string", pattern: sticky(/"(?:[^"\\\n]|\\.)*"/) },
  { type: "string", pattern: sticky(/'(?:[^'\\\n]|\\.)*'/) },
  { type: "punctuation", pattern: sticky(/[{};:,]/g) },
];

const bashRules: Rule[] = [
  { type: "comment", pattern: sticky(/#[^\n]*/) },
  { type: "string", pattern: sticky(/"(?:[^"\\\n]|\\.)*"/) },
  { type: "string", pattern: sticky(/'(?:[^'\\\n]|\\.)*'/) },
  {
    type: "keyword",
    pattern: sticky(/\b(?:cd|cp|npm|npx|pnpm|yarn|node|git|bash|sh)\b/),
  },
];


export function tokenize(source: string, rules: Rule[]): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    let matched = false;

    for (const rule of rules) {
      rule.pattern.lastIndex = index;
      const match = rule.pattern.exec(source);

      if (match && match[0].length > 0) {
        tokens.push({ type: rule.type, value: match[0] });
        index += match[0].length;
        matched = true;
        break;
      }
    }

    if (matched) {
      continue;
    }

    const last = tokens[tokens.length - 1];
    const character = source[index] ?? "";

    if (last && last.type === "plain") {
      last.value += character;
    } else {
      tokens.push({ type: "plain", value: character });
    }

    index += 1;
  }

  return tokens;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


export function renderTokens(tokens: Token[]): string {
  return tokens
    .map((token) => {
      const escaped = escapeHtml(token.value);

      if (token.type === "plain") {
        return escaped;
      }

      return `<span class="tok tok--${token.type}">${escaped}</span>`;
    })
    .join("");
}

function renderWith(source: string, rules: Rule[]): string {
  return renderTokens(tokenize(source, rules));
}


export function highlightTs(source: string): string {
  return renderWith(source, tsRules);
}


export function highlightBash(source: string): string {
  return renderWith(source, bashRules);
}

interface BlockSegment {
  start: number;
  end: number;
  mode: "template" | "ts" | "style";
}

interface Region {
  start: number;
  end: number;
  mode: BlockSegment["mode"];
}

function collectRegions(source: string): Region[] {
  const patterns: Array<[RegExp, BlockSegment["mode"]]> = [
    [/<script\b[^>]*>/g, "ts"],
    [/<template\b[^>]*>/g, "template"],
    [/<style\b[^>]*>/g, "style"],
  ];

  const regions: Region[] = [];

  for (const [pattern, mode] of patterns) {
    let match = pattern.exec(source);

    while (match !== null) {
      const openEnd = match.index + match[0].length;
      const closingTag = new RegExp(`</${mode === "ts" ? "script" : mode}>`, "g");
      closingTag.lastIndex = openEnd;
      const closing = closingTag.exec(source);
      const closeEnd = closing ? closing.index + closing[0].length : openEnd;

      regions.push({
        start: match.index,
        end: openEnd,
        mode: "template",
      });

      regions.push({ start: openEnd, end: closeEnd - (closing ? closing[0].length : 0), mode });

      if (closing) {
        regions.push({
          start: closeEnd - closing[0].length,
          end: closeEnd,
          mode: "template",
        });
      }

      match = pattern.exec(source);
    }
  }

  return regions.sort((a, b) => a.start - b.start);
}


export function highlightVue(source: string): string {
  const regions = collectRegions(source);
  let result = "";
  let cursor = 0;

  for (const region of regions) {
    if (region.start > cursor) {
      result += renderWith(source.slice(cursor, region.start), templateRules);
    }

    const rules =
      region.mode === "ts"
        ? tsRules
        : region.mode === "style"
          ? styleRules
          : templateRules;

    result += renderWith(source.slice(region.start, region.end), rules);
    cursor = region.end;
  }

  if (cursor < source.length) {
    result += renderWith(source.slice(cursor), templateRules);
  }

  return result;
}
