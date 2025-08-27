import type { CatProp, DetailRow } from "@/types/report";

/** 안전 문자열화 */
const S = (v: any) => {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    const flat: Record<string, any> = {};
    Object.entries(v).forEach(([k, val]) => {
      if (val == null) return;
      if (["string", "number", "boolean"].includes(typeof val)) flat[k] = val;
    });
    const s = JSON.stringify(flat);
    return s === "{}" ? "" : s;
  } catch {
    return "";
  }
};

const truncate = (s: string, max = 600) =>
  s.length > max ? s.slice(0, max) + "…" : s;

const pickMany = (obj: Record<string, any>, keys: string[]) => {
  for (const k of keys) {
    if (k in obj) {
      const sv = S(obj[k]);
      if (sv) return sv;
    }
  }
  return "";
};

const findDeepByKey = (obj: any, re: RegExp, maxDepth = 4): string => {
  const seen = new WeakSet();
  const walk = (o: any, d: number): string => {
    if (!o || typeof o !== "object" || seen.has(o) || d > maxDepth) return "";
    seen.add(o);
    for (const [k, v] of Object.entries(o)) {
      if (re.test(k)) {
        const sv = S(v);
        if (sv) return sv;
      }
      if (typeof v === "object") {
        const got = walk(v, d + 1);
        if (got) return got;
      }
    }
    return "";
  };
  return walk(obj, 0);
};

const styleSnippet = (style: any) => {
  if (!style) return "";
  if (typeof style === "string") return style;
  if (typeof style === "object") {
    const bg =
      style["background-image"] ||
      style["backgroundImage"] ||
      style["background"];
    if (bg) return `background-image: ${S(bg)}`;
    const color = style["color"] || style["fill"];
    const fs = style["font-size"] || style["fontSize"];
    const parts = [
      color ? `color:${S(color)}` : "",
      fs ? `font-size:${S(fs)}` : "",
    ].filter(Boolean);
    return parts.join("  ");
  }
  return "";
};

const CANDIDATE_KEYS_BY_CAT: Record<CatProp, string[]> = {
  alt_text_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "path",
    "cssPath",
    "src",
    "image_src",
    "data_src",
    "currentSrc",
    "message",
    "reason",
    "code",
    "snippet",
  ],
  video_caption_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "src",
    "track_src",
    "video_src",
    "path",
    "message",
    "reason",
    "code",
    "snippet",
  ],
  video_autoplay_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "src",
    "path",
    "message",
    "reason",
    "code",
    "snippet",
  ],
  table_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "summary",
    "caption",
    "headers",
    "message",
    "reason",
    "code",
    "snippet",
  ],
  contrast_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "text",
    "path",
    "message",
    "reason",
    "snippet",
  ],
  keyboard_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "path",
    "role",
    "tabindex",
    "message",
    "reason",
    "code",
    "snippet",
  ],
  label_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "for",
    "id",
    "name",
    "message",
    "reason",
    "code",
    "snippet",
  ],
  markup_error_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "path",
    "tag",
    "message",
    "error",
    "code",
    "snippet",
  ],
  basic_language_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "lang",
    "message",
    "reason",
    "snippet",
  ],
  heading_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "text",
    "level",
    "message",
    "reason",
    "snippet",
  ],
  response_time_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "message",
    "reason",
    "snippet",
  ],
  pause_control_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "message",
    "reason",
    "snippet",
  ],
  flashing_results: [
    "outerHTML",
    "outer_html",
    "element_html",
    "node_html",
    "html",
    "selector",
    "xpath",
    "frequency",
    "message",
    "reason",
    "snippet",
  ],
};

export function extractIssueTextForPdf(prop: CatProp, r: DetailRow) {
  const primary = pickMany(r, CANDIDATE_KEYS_BY_CAT[prop]);

  const deepHtml =
    primary ||
    findDeepByKey(
      r,
      /(outer|inner)?HTML|element_html|node_html|snippet|code/i,
      4
    );

  const extras: string[] = [];
  switch (prop) {
    case "alt_text_results": {
      const alt =
        r.alt !== undefined
          ? `alt:${S(r.alt)}`
          : r.alt_text !== undefined
          ? `alt:${S(r.alt_text)}`
          : "";
      if (alt) extras.push(alt);
      const bg = findDeepByKey(r, /background-?image/i, 2);
      if (bg) extras.push(`bg:${bg}`);
      break;
    }
    case "video_caption_results":
      if (r.has_transcript === false) extras.push("no transcript");
      break;
    case "video_autoplay_results":
      if (r.autoplay_detected || r.autoplay) extras.push("autoplay:true");
      break;
    case "label_results":
      if (r.for) extras.push(`for:${S(r.for)}`);
      if (r.label_text) extras.push(`<label>${S(r.label_text)}</label>`);
      break;
    case "keyboard_results":
      if (r.role) extras.push(`role:${S(r.role)}`);
      if (r.tabindex != null) extras.push(`tabindex:${S(r.tabindex)}`);
      break;
    case "markup_error_results":
      if (r.tag) extras.push(`<${S(r.tag)}>`);
      if (r.message) extras.push(`msg:${S(r.message)}`);
      break;
    case "basic_language_results":
      if (r.lang) extras.push(`lang:${S(r.lang)}`);
      break;
    case "heading_results":
      if (r.level) extras.push(`h${S(r.level)}`);
      break;
  }

  const base =
    deepHtml ||
    pickMany(r, [
      "selector",
      "xpath",
      "cssPath",
      "path",
      "src",
      "image_src",
      "data_src",
      "href",
      "text",
      "textContent",
      "name",
      "id",
      "tagName",
      "title",
      "message",
      "reason",
    ]) ||
    styleSnippet(r.style);

  const joined = [base, ...extras].filter(Boolean).join("  •  ");
  return truncate(joined || "-");
}
