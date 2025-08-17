import { NOTION_URLS } from "./notionUrls";

export interface TermConfig {
  id: string;
  label: string;
  linkText?: string;
  url?: string;
  route?: string; // 추가된 라우트 속성
  required: boolean;
}

export const TERMS_CONFIG: TermConfig[] = [
  {
    id: "ageAgree",
    label: "(필수) 만 14세 이상입니다.",
    required: true,
  },
  {
    id: "serviceAgree",
    label: "(필수)",
    linkText: "서비스 이용약관",
    url: NOTION_URLS.SERVICE_TERMS,
    route: "/terms/service", // 추가된 라우트
    required: true,
  },
  {
    id: "privacyAgree",
    label: "(필수)",
    linkText: "개인정보 수집 및 이용",
    url: NOTION_URLS.PRIVACY_POLICY,
    route: "/terms/privacy-policy", // 추가된 라우트
    required: true,
  },
  {
    id: "marketingAgree",
    label: "(선택)",
    linkText: "마케팅 목적의 개인정보 수집 및 이용",
    url: NOTION_URLS.MARKETING_TERMS,
    route: "/terms/marketing-consent", // 추가된 라우트
    required: false,
  },
];

// 필수 약관 ID들을 추출하는 유틸리티
export const getRequiredTermIds = (): string[] => {
  return TERMS_CONFIG.filter((term) => term.required).map((term) => term.id);
};

// 약관 ID로 설정 찾기
export const getTermConfigById = (id: string): TermConfig | undefined => {
  return TERMS_CONFIG.find((term) => term.id === id);
};
