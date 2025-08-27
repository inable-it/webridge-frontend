export type DetailRow = Record<string, any>;

/** CATS 각 항목의 결과 prop 유니온 타입을 동적으로 import 후 재활용 예정 */
export type CatProp =
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
