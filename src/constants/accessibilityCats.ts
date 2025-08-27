import type { DetailRow, CatProp } from "@/types/report";

export const CATS: {
  id: number;
  title: string;
  prop: CatProp;
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

export type Cat = (typeof CATS)[number]["prop"];
