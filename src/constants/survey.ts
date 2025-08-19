import type { Option } from "@/types/shared";

export const PATH_OPTIONS: Option[] = [
  { label: "SNS", value: "a" },
  { label: "웹 포털 검색", value: "b" },
  { label: "동료 / 지인 추천", value: "c" },
  { label: "커뮤니티(슬랙/오픈채팅방)", value: "d" },
  { label: "이메일 홍보", value: "e" },
  { label: "기타", value: "f" },
];

export const JOB_OPTIONS: Option[] = [
  { label: "PM/PO", value: "a" },
  { label: "기획", value: "b" },
  { label: "디자인", value: "c" },
  { label: "개발/엔지니어링", value: "d" },
  { label: "웹 접근성 전문가 / 컨설턴트", value: "e" },
  { label: "기타", value: "f" },
];
