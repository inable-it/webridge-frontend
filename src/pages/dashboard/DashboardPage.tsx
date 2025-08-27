import { useEffect, useMemo, useRef } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
  type NavigateOptions,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePdfGenerator } from "@/hooks/usePdfGenerator";
import {
  useCreateScanMutation,
  useGetScanListQuery,
} from "@/features/api/scanApi";
import SurveyModal from "@/components/common/SurveyModal";
import { toast } from "@/hooks/use-toast";

import { UrlScanForm } from "@/pages/dashboard/UrlScanForm";
import { ScanList } from "@/pages/dashboard/ScanList";
import { ResultTable } from "@/pages/dashboard/ResultTable";
import { useScanSelection } from "@/hooks/useScanSelection";
import { useScanPolling } from "@/hooks/useScanPolling";
import { useSurveyTrigger } from "@/hooks/useSurveyTrigger";

type DetailRow = Record<string, any>;

/* =========================================
 * 1) 항목 정의
 * ======================================= */
const CATS: {
  id: number;
  title: string;
  prop:
    | "alt_text_results"
    | "video_caption_results"
    | "video_autoplay_results"
    | "table_results"
    | "contrast_results"
    | "keyboard_results"
    | "label_results"
    | "markup_error_results"
    | "basic_language_results"
    | "heading_results"
    | "response_time_results"
    | "pause_control_results"
    | "flashing_results";
  isFail: (r: DetailRow) => boolean;
  isPass: (r: DetailRow) => boolean;
}[] = [
  {
    id: 1,
    title: "적절한 대체 텍스트 제공",
    prop: "alt_text_results",
    isFail: (r) => r.compliance !== 0,
    isPass: (r) => r.compliance === 0,
  },
  {
    id: 2,
    title: "자막 제공",
    prop: "video_caption_results",
    isFail: (r) => !r.has_transcript,
    isPass: (r) => !!r.has_transcript,
  },
  {
    id: 3,
    title: "표의 구성",
    prop: "table_results",
    isFail: (r) => !r.compliant,
    isPass: (r) => !!r.compliant,
  },
  {
    id: 4,
    title: "자동 재생 금지",
    prop: "video_autoplay_results",
    isFail: (r) => !r.autoplay_disabled,
    isPass: (r) => !!r.autoplay_disabled,
  },
  {
    id: 5,
    title: "텍스트 콘텐츠의 명도 대비",
    prop: "contrast_results",
    isFail: (r) => !r.wcag_compliant,
    isPass: (r) => !!r.wcag_compliant,
  },
  {
    id: 6,
    title: "키보드 사용 보장",
    prop: "keyboard_results",
    isFail: (r) => !r.accessible,
    isPass: (r) => !!r.accessible,
  },
  {
    id: 7,
    title: "레이블 제공",
    prop: "label_results",
    isFail: (r) => !r.label_present,
    isPass: (r) => !!r.label_present,
  },
  {
    id: 8,
    title: "마크업 오류 방지",
    prop: "markup_error_results",
    isFail: (r) => !r.compliant,
    isPass: (r) => !!r.compliant,
  },
  {
    id: 9,
    title: "기본 언어 표시",
    prop: "basic_language_results",
    isFail: (r) => !r.compliant,
    isPass: (r) => !!r.compliant,
  },
  {
    id: 10,
    title: "제목 제공",
    prop: "heading_results",
    isFail: (r) => !r.compliant,
    isPass: (r) => !!r.compliant,
  },
  {
    id: 11,
    title: "응답 시간 조절",
    prop: "response_time_results",
    isFail: (r) => !r.compliant,
    isPass: (r) => !!r.compliant,
  },
  {
    id: 12,
    title: "정지 기능 제공",
    prop: "pause_control_results",
    isFail: (r) => !r.compliant,
    isPass: (r) => !!r.compliant,
  },
  {
    id: 13,
    title: "깜빡임과 번쩍임 사용 제한",
    prop: "flashing_results",
    isFail: (r) => !r.compliant,
    isPass: (r) => !!r.compliant,
  },
];

// 결과 prop 유니온 타입
type Cat = (typeof CATS)[number]["prop"];

/* =========================================
 * 2) PDF 상세에 들어갈 "오류 스니펫" 추출 유틸
 *  - 오류 보기 화면과 같은 정보(코드/HTML/메시지 등)를
 *    최대한 뽑아오도록 키를 확장
 * ======================================= */
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

const CANDIDATE_KEYS_BY_CAT: Record<Cat, string[]> = {
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

function extractIssueTextForPdf(prop: Cat, r: Record<string, any>) {
  // 1) 항목 우선 키
  const primary = pickMany(r, CANDIDATE_KEYS_BY_CAT[prop]);

  // 2) 깊이 탐색으로 html/snippet 류 보강
  const deepHtml =
    primary ||
    findDeepByKey(
      r,
      /(outer|inner)?HTML|element_html|node_html|snippet|code/i,
      4
    );

  // 3) 항목별 메타
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

  // 4) 최종 조립
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

/* =========================================
 * 3) 가이드 텍스트
 * ======================================= */
const GUIDE_TEXT: Record<
  number,
  { judge: string[]; how: string[]; consider: string[] }
> = {
  1: {
    judge: [
      "이미지에 alt 속성이 아예 없는 경우",
      "이미지에 입력된 대체 텍스트가 이미지의 의미와 맞지 않는 경우",
    ],
    how: [
      "모든 의미있는 이미지에는 alt 속성을 통해 대체텍스트를 입력해야 해요.",
      "대체텍스트는 이미지의 의미나 용도를 동등하게 인식할 수 있도록 작성해야 해요.",
      "대체텍스트는 간단명료하게 제공하는 것이 좋아요.",
    ],
    consider: [
      "이미지 외에도 동영상 등의 텍스트가 아닌 콘텐츠에도 대체 텍스트가 필요해요.",
      "수어 영상처럼 이미 내용을 전달하고 있는 콘텐츠에는 대체 텍스트를 따로 넣지 않아도 괜찮아요.",
      "장식용 이미지는 alt를 빈값으로 설정하면, 보조기술이 불필요한 정보를 건너뛸 수 있어요.",
    ],
  },
  2: {
    judge: ["동영상에 script가 포함되어 있지 않은 경우"],
    how: [
      "멀티미디어 콘텐츠를 제공할 때는 자막, 대본, 수어 중 한 가지 이상의 대체 수단을 제공해야 해요.",
      "대사 없이 영상만 제공하는 경우, 화면해설(텍스트, 오디오, 대본)을 제공해야 해요.",
      "음성만 제공하는 경우, 대본 또는 수어를 제공해야 해요.",
    ],
    consider: [
      "대체 수단(자막, 대본, 수어)을 제공할 때는, 멀티미디어 콘텐츠와 동등한 내용을 제공해야 해요.",
      "가장 바람직한 방법은 폐쇄자막을 오디오와 동기화하여 제공하는 것이에요.",
      "대체수단을 여러 언어로 제공하면, 사용자는 자신이 사용하길 원하는 언어를 선택할 수 있어야 해요.",
    ],
  },
  3: {
    judge: ["표의 제목 셀과 데이터 셀이 구분되지 않은 경우"],
    how: [
      "제목 셀은 th로 내용 셀은 td로 마크업 해야 해요.",
      "제목 셀이 행과 열에 모두 있는 경우 scope로 행 제목인지 열 제목인지 구분해야 해요.",
      "복잡한 표의 경우 id와 headers 속성을 이용하면 제목 셀과 내용 셀을 정확하게 연결할 수 있어요.",
    ],
    consider: [
      "표의 내용, 구조 등 표의 정보를 제공하여 표의 이용 방법을 예측할 수 있도록 해야 해요.",
      "caption으로 제목을, table의 summary 속성으로 요약 정보를 제공해야 해요.",
      "마크업 시 데이터 테이블과, 레이아웃 테이블이 혼동되지 않도록 유의해야 해요.",
    ],
  },
  4: {
    judge: ["자동 재생 플레이어가 있는 경우"],
    how: [
      "웹 페이지 진입 시 자동 재생되는 3초 이상의 멀티미디어 파일은 정지 상태로 제공되어야 해요.",
      "사용자가 요구할 경우에만 재생할 수 있도록 소리 제어 수단(멈춤, 일시 정지, 음량 조절 등)을 제공해야 해요.",
    ],
    consider: [
      "자동 재생 소리가 3초 이상인지 미만인지 확인해야 해요.",
      "자동 재생 기능을 제공해야 할 경우 3초 내에 정지, 지정된 키(ex. esc키) 선택 시 정지, 소스 상 가장 먼저 제공하여 정지 기능 실행하도록 구현하면 돼요.",
    ],
  },
  5: {
    judge: ["텍스트 콘텐츠와 배경 간의 명도 대비가 4.5 대 1 미만인 경우"],
    how: [
      "텍스트 콘텐츠(텍스트 및 텍스트 이미지)와 배경 간의 명도 대비가 4.5 대 1 이상이 되도록 색상을 사용해야 해요.",
    ],
    consider: [
      "굵은 텍스트 폰트(18pt 이상 또는 14pt 이상)를 이용한다면 명도 대비를 3 대 1까지 낮출 수 있어요.",
      "화면 확대가 가능한 텍스트 콘텐츠라면 명도 대비를 3 대 1까지 낮출 수 있어요.",
      "로고, 장식 목적의 콘텐츠, 마우스나 키보드를 활용하여 초점을 받았을 때 명도 대비가 커지는 콘텐츠 등은 예외로 해요.",
    ],
  },
  6: {
    judge: ["웹 사이트 내 Tab 키로 접근이 불가능한 요소가 있는 경우"],
    how: [
      "웹 페이지에서 제공하는 모든 기능은 Tab키로 접근이 가능해야 해요.",
      "예: 마우스 오버 시 드롭 다운 메뉴가 노출되는 경우, 키보드 접근 시에도 드롭 다운 메뉴가 노출되고 메뉴에 접근 가능하도록 구현해야 함",
    ],
    consider: [
      "모든 기능은 키보드만으로도 사용할 수 있어야 하며, Tab 키를 이용한 이동뿐 아니라 클릭과 같은 동작도 키보드로 실행할 수 있어야 해요.",
      "위치 지정 도구의 커서 궤적이 중요한 역할을 하거나, 움직임 측정 센서를 이용하는 콘텐츠는  검사항목의 예외 콘텐츠로 간주해요.",
      "예외 콘텐츠의 경우에도 해당 기능을 제외한 나머지 사용자 인터페이스는 키보드만으로도 사용할 수 있어야 해요.",
    ],
  },
  7: {
    judge: ["입력 서식과 레이블이 1:1로 매칭되어 있지 않은 경우"],
    how: [
      "레이블과 사용자 입력 간의 관계를 대응시켜야 해요.",
      "레이블을 제공하고 label for 값과 input의 id 값을 동일하게 제공해야 해요.",
    ],
    consider: [
      "레이블과 입력 서식이 1:다 매칭인 경우 각 입력 서식에 대해 title을 제공해야 해요.",
      "레이블이 시각적으로 노출되지 않은 경우 각 입력 서식에 대해 title을 제공해야 해요.",
    ],
  },
  8: {
    judge: ["중복된 속성을 사용한 경우", "id 속성값을 중복으로 사용한 경우"],
    how: [
      "마크업 언어로 작성된 콘텐츠는 해당 마크업 언어의 문법을 최대한 준수하여 제공해야 해요.",
      "요소의 속성도 마크업 문법을 최대한 준수하여 제공해야 해요.",
      "요소의 열고 닫음, 중첩 관계의 오류가 없도록 제공해야 해요.",
      "중복된 속성 사용 금지: 하나의 요소 안에서 속성을 중복하여 선언하지 않아야 해요.",
      "id 속성값 중복 선언 금지: 하나의 마크업 문서에서는 같은 id값을 중복하여 선언하지 않아야 해요.",
    ],
    consider: [
      "요소의 열고 닫음 일치: 마크업 언어로 작성된 콘텐츠는 표준에서 특별히 정한 경우를 제외하고 시작 요소와 끝나는 요소가 정의되어야 해요.",
      "요소의 중첩 방지: 시작 요소와 끝나는 요소의 나열 순서는 포함 관계가 어긋나지 않아야 해요.",
    ],
  },
  9: {
    judge: ["웹 페이지의 기본 언어 표시가 명시되어 있지 않은 경우"],
    how: [
      "웹 페이지에서 제공하는 콘텐츠에 적용되는 기본 언어를 반드시 정의해야 해요.",
      "기본 언어 표시는 HTML 태그에 lang 속성을 사용하여 'ISO639-1'에서 지정한 두 글자로 된 언어 코드로 제공할 수 있어요.",
    ],
    consider: [],
  },
  10: {
    judge: [
      "웹 페이지, 팝업창, 프레임에 제목이 존재하지 않는 경우",
      "!!!, ???, *** 등 불필요한 특수 기호를 반복 사용한 경우",
    ],
    how: [
      "제목은 간결하고 명확하게 작성하며, 해당 페이지·프레임·콘텐츠 블록의 내용을 유추할 수 있도록 해야 해요.",
      "웹 페이지는 유일하고 서로 다른 제목(title)을 제공해야 해요.",
      "팝업창에도 제목(title)을 제공해야 해요.",
      "프레임에도 제목(title)을 제공해야 하며, 내용이 없을 경우 ‘빈 프레임’과 같이 표시해야 해요.",
      "제목 작성 시 불필요한 특수 기호를 반복 사용하지 않아야 해요.",
    ],
    consider: [
      "콘텐츠 블록에도 적절한 제목(heading)을 제공하되, 본문이 없는 블록에는 제목을 붙이지 않아야 해요.",
    ],
  },
  11: {
    judge: ["시간 제한 콘텐츠가 존재하는 경우"],
    how: [
      "시간 제한이 있는 콘텐츠는 제공하지 않아야 해요.",
      "반응 시간이 정해진 콘텐츠를 제공해야 하는 경우, 최소 20초 이상의 시간을 부여하고 사전에 반응 시간 조절 방법을 안내해야 해요.",
      "시간 제한을 해제하거나 연장할 수 있는 선택지를 제공하여 사용자가 반응 시간을 조절할 수 있도록 해야 해요.",
    ],
    consider: [
      "반응 시간 조절이 원천적으로 불가능한 경우(예: 온라인 경매, 실시간 게임)는 본 검사 항목이 적용되지 않아요.",
      "검사 항목에 해당하지 않더라도, 사용자에게 시간 제한이 있다는 사실과 종료 시점을 반드시 알려주어야 해요.",
      "세션 시간이 20시간 이상인 콘텐츠는 예외로 간주돼요.",
    ],
  },
  12: {
    judge: ["스크롤 및 자동 갱신되는 콘텐츠를 정지할 수 없는 경우"],
    how: [
      "스크롤 및 자동 갱신되는 콘텐츠의 사용을 배제하는 것이 좋아요.",
      "스크롤 및 자동 갱신되는 콘텐츠를 사용할 경우 제어 기능(예: 정지, 앞으로 이동, 뒤로 이동)을 제공해야 해요.",
    ],
    consider: ["제어 기능이 정상적으로 작동하는지 테스트해야 해요."],
  },
  13: {
    judge: ["초당 3~50회의 속도로 번쩍이는 콘텐츠가 있는 경우"],
    how: [
      "초당 3~50회로 깜빡이는 콘텐츠는 깜빡임을 정지할 수 있는 기능을 제공해야 해요.",
      "번쩍임이 초당 3~50회일 경우, 10인치 이상 화면에서 해당 콘텐츠가 차지하는 면적 합은 화면 전체의 10%를 넘지 않아야 해요.",
      "콘텐츠의 번쩍임 지속 시간은 3초 미만으로 제한해야 해요.",
    ],
    consider: [
      "10인치 이상 화면을 사용하는 기기(예: 태블릿, PC 모니터, 무인 안내기 등)에서는 광과민성 발작 유발 가능성에 특히 주의해야 해요.",
    ],
  },
};

const DEFAULT_GUIDE = {
  judge: ["해당 항목의 검사 기준을 만족하지 않는 패턴이 탐지되었습니다."],
  how: [
    "관련 KWCAG/WCAG 기준에 따라 마크업과 상호작용을 보완합니다.",
    "역할과 상태를 스크린리더가 인식할 수 있도록 적절한 속성/구조를 제공합니다.",
  ],
  consider: [
    "색 대비, 키보드 접근성, 포커스 이동, 라이브영역 등 연관 준수 항목도 함께 점검하세요.",
  ],
};

/* =========================================
 * 4) 공통 포맷터
 * ======================================= */
function formatCompliance(pass: number, total: number) {
  if (!total) return "-";
  const pct = Math.round((pass / total) * 100);
  return `${pct}%(${pass}/${total})`;
}

/* =========================================
 * 5) PDF 요약 테이블
 *   - 명도 대비 항목만 준수율 하이픈 처리
 * ======================================= */
const PdfSummaryTable = ({
  selectedScanDetail,
}: {
  selectedScanDetail: any | null;
}) => {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th className="w-20 p-3 text-left">순번</th>
          <th className="p-3 text-left">검사 항목</th>
          <th className="p-3 text-right w-36">준수율</th>
        </tr>
      </thead>
      <tbody>
        {CATS.map((cat) => {
          const all: DetailRow[] =
            (selectedScanDetail && selectedScanDetail[cat.prop]) || [];
          const pass = all.filter(cat.isPass).length;
          const total = all.length || 0;

          const isContrast = cat.prop === "contrast_results";
          const display = isContrast ? "-" : formatCompliance(pass, total);

          return (
            <tr key={cat.id} className="border-b last:border-b-0">
              <td className="p-3">{cat.id}</td>
              <td className="p-3">{cat.title}</td>
              <td className="p-3 text-right">{display}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

/* =========================================
 * 6) 페이지 본문
 * ======================================= */
const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const resultPanelRef = useRef<HTMLDivElement | null>(null);
  const { generatePdf } = usePdfGenerator();

  const {
    data: scanListData,
    isLoading: isLoadingList,
    refetch: refetchScanList,
  } = useGetScanListQuery({ page: 1, page_size: 50, ordering: "-created_at" });

  const {
    selectedScanId,
    setSelectedScanId,
    displayScan,
    isDisplayingScanDetail,
    selectedScanDetail,
    selectedStatus,
    progressingScanIds,
    refetchDetail,
  } = useScanSelection(scanListData);

  useScanPolling({
    progressingScanIds,
    selectedScanId,
    selectedStatus,
    refetchList: refetchScanList,
    refetchDetail,
  });

  const { openSurvey, closeSurvey } = useSurveyTrigger({
    scanListData,
    selectedScanDetail,
  });

  // 히스토리/딥링크에서 넘어온 scanId 추출
  const incomingScanId = useMemo(() => {
    const fromState = location.state?.scanId as string | undefined;
    const fromQuery = searchParams.get("scanId") || undefined;
    return fromState ?? fromQuery;
  }, [location.state, searchParams]);

  // 목록이 로드되면 incomingScanId 자동 선택 + 포커스 + state/쿼리 정리
  useEffect(() => {
    if (!scanListData?.results || !incomingScanId) return;

    const exists = scanListData.results.some((s) => s.id === incomingScanId);
    if (!exists) return;

    setSelectedScanId(incomingScanId);

    requestAnimationFrame(() => {
      resultPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    const opts: NavigateOptions = { replace: true, state: {} };
    if (searchParams.has("scanId")) {
      const sp = new URLSearchParams(searchParams);
      sp.delete("scanId");
      navigate(
        { pathname: location.pathname, search: sp.toString() ? `?${sp}` : "" },
        opts
      );
    } else if (location.state?.scanId) {
      navigate(location.pathname, opts);
    }
  }, [
    scanListData?.results,
    incomingScanId,
    setSelectedScanId,
    navigate,
    location.pathname,
    location.state,
    searchParams,
  ]);

  const [createScan, { isLoading: isCreating }] = useCreateScanMutation();
  const onStartScan = async (url: string) => {
    try {
      const result = await createScan({ url }).unwrap();
      toast({
        title: "검사 시작",
        description: "웹 접근성 검사가 시작되었습니다!",
      });
      setSelectedScanId(result.scan.id);
      refetchScanList();
    } catch (error: any) {
      console.error("스캔 생성 실패:", error);
      toast({
        title: "오류",
        description: error?.data?.message || "검사 시작에 실패했습니다.",
      });
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-[#ecf3ff] p-8 gap-5">
        {/* 왼쪽: 입력 + 최근 검사 */}
        <div className="flex w-[320px] space-y-6 rounded-lg flex-col">
          <div className="w-[320px] bg-[#f4f8ff] border-2 p-6 space-y-6 rounded-lg">
            <UrlScanForm isCreating={isCreating} onStartScan={onStartScan} />
          </div>

          <div className="w-[320px] bg-[#f4f8ff] border-2 p-6 space-y-6 rounded-lg">
            <ScanList
              isLoading={isLoadingList}
              scanList={scanListData?.results || []}
              selectedScanId={selectedScanId}
              onSelect={setSelectedScanId}
            />
          </div>
        </div>

        {/* 오른쪽: 검사 결과(대시보드용). PDF 레이아웃은 오프스크린 처리 */}
        <div
          ref={resultPanelRef}
          className="flex-1 min-w-0 p-8 bg-white border-2 rounded-lg shadow-md"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 min-w-0 mr-4">
              <h1 className="text-xl font-semibold">
                WEBridge 웹 접근성 검사 요약 보고서
              </h1>
              <p className="mt-1 text-sm text-gray-500 break-words">
                {displayScan ? (
                  <>
                    홈페이지명 : {displayScan.title || "(제목 없음)"} <br />
                    <span className="break-all">{displayScan.url}</span>
                  </>
                ) : (
                  <>
                    홈페이지명 : 검사를 시작해주세요 <br /> URL을 입력하고
                    검사를 시작하면 결과가 표시됩니다
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date().toLocaleDateString("ko-KR")} / 한국형 웹 콘텐츠
                접근성 지침 2.2 기준
              </p>
            </div>

            <Button
              onClick={() =>
                generatePdf(
                  ["summaryReport", "detailReport"], // 요약 → 상세 (둘 다 오프스크린)
                  `webridge-report-${displayScan?.title || "report"}.pdf`,
                  {
                    targetDpi: 144,
                    baseScale: 2,
                    marginMm: 10,
                    backgroundColor: "#ffffff",
                  }
                )
              }
              disabled={!displayScan || displayScan.status !== "completed"}
            >
              PDF로 저장하기
            </Button>
          </div>

          {/* 대시보드 화면에서만 보이는 기본 테이블 */}
          <div className="p-6 bg-white border rounded-lg">
            <ResultTable
              displayScan={displayScan}
              isDisplayingScanDetail={isDisplayingScanDetail}
              selectedScanDetail={selectedScanDetail}
              onNavigate={(path) => navigate(path)}
            />
          </div>
        </div>
      </div>

      {/* === PDF 전용 섹션: 화면에 보이지 않도록 오프스크린 렌더링 === */}
      {/* 1) 요약 보고서 (PDF 첫 페이지) */}
      <div
        id="summaryReport"
        aria-hidden
        className="fixed -left-[200vw] top-0 w-[900px] p-10 bg-white"
        style={{ zIndex: -1 }}
      >
        <h1 className="mb-6 text-3xl font-bold text-center">
          WEBridge 웹 접근성 검사 보고서
        </h1>
        <div className="h-px mb-6 bg-gray-200" />
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
          <div className="space-y-1">
            <p>
              <span className="font-semibold">홈페이지명 :</span>{" "}
              {displayScan?.title || "-"}
            </p>
            <p className="break-all">
              <span className="font-semibold">URL :</span>{" "}
              {displayScan?.url || "-"}
            </p>
            <p>
              <span className="font-semibold">검사 일시 :</span>{" "}
              {new Date().toLocaleDateString("ko-KR")} 00:00
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p>
              <span className="font-semibold">사용 검진 도구 :</span> WEBridge
              1.0
            </p>
            <p>
              <span className="font-semibold">검사 기준 :</span> 한국형 웹
              콘텐츠 접근성 지침 2.2
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium text-gray-700">
              웹 접근성 검사 요약 보고서
            </p>
          </div>
          <div className="p-4">
            <PdfSummaryTable selectedScanDetail={selectedScanDetail} />
          </div>
        </div>
      </div>

      {/* 2) 상세 보고서 (PDF 두 번째 페이지부터) */}
      <div
        id="detailReport"
        aria-hidden
        className="fixed -left-[200vw] top-0 w-[900px] p-10 bg-white"
        style={{ zIndex: -1 }}
      >
        <header className="mb-8">
          <h1 className="mb-6 text-2xl font-bold text-center">
            WEBridge 웹 접근성 검사 보고서
          </h1>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="space-y-1">
              <p>
                <span className="font-semibold">홈페이지명 :</span>{" "}
                {displayScan?.title || "-"}
              </p>
              <p className="break-all">
                <span className="font-semibold">URL :</span>{" "}
                {displayScan?.url || "-"}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p>
                <span className="font-semibold">사용 검진 도구 :</span> WEBridge
                1.0
              </p>
              <p>
                <span className="font-semibold">검사 일시 :</span>{" "}
                {new Date().toLocaleDateString("ko-KR")} 00:00
              </p>
              <p>
                <span className="font-semibold">검사 기준 :</span> 한국형 웹
                콘텐츠 접근성 지침 2.2
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          {CATS.map((cat) => {
            const all: DetailRow[] =
              (selectedScanDetail && selectedScanDetail[cat.prop]) || [];
            const pass = all.filter(cat.isPass).length;
            const total = all.length || 0;
            const isContrast = cat.prop === "contrast_results";
            const issues = isContrast ? [] : all.filter(cat.isFail);
            const guide = GUIDE_TEXT[cat.id] || DEFAULT_GUIDE;

            return (
              <section key={cat.id} className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-base font-semibold">
                    [상세 보고서] {cat.id}. {cat.title}
                  </h2>
                  <div className="text-sm text-gray-600">
                    준수율 : {isContrast ? "-" : formatCompliance(pass, total)}
                  </div>
                </div>

                {/* 명도 대비는 지원 제외 안내 */}
                {isContrast ? (
                  <div className="p-6 text-center border border-gray-200 rounded-2xl">
                    <p className="font-medium text-red-600">
                      현재 지원하지 않는 검사 항목입니다.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-2xl">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="w-20 p-3 text-left">순번</th>
                          <th className="p-3 text-left">미준수 항목</th>
                        </tr>
                      </thead>
                      <tbody>
                        {issues.length ? (
                          issues.map((r, idx) => (
                            <tr key={idx} className="border-b last:border-b-0">
                              <td className="p-3">{idx + 1}</td>
                              <td className="p-3 break-all">
                                {extractIssueTextForPdf(cat.prop, r)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="p-4 text-gray-500" colSpan={2}>
                              표기할 이슈가 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 가이드 */}
                <div className="rounded-2xl bg-[#eaf2ff] p-5 space-y-3">
                  <p className="font-semibold">
                    [수정 참고 가이드] {cat.id}. {cat.title}
                  </p>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      현재 “{cat.title}” 항목의 오류 대상은 다음과 같은 기준으로
                      판단하고 있어요.
                    </p>
                    <ul className="pl-5 text-sm text-center text-gray-700 list-disc">
                      {guide.judge.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      이를 수정하기 위해서는 아래 내용을 준수하세요.
                    </p>
                    <ul className="pl-5 text-sm text-gray-700 list-disc">
                      {guide.how.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      WEBridge 검사 이외에 이런 점도 고려해야 해요.
                    </p>
                    <ul className="pl-5 text-sm text-gray-700 list-disc">
                      {guide.consider.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <SurveyModal open={openSurvey} onClose={closeSurvey} />
    </>
  );
};

export default DashboardPage;
