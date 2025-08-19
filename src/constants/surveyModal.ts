export const Q1_COMPANY_TYPES = [
  { code: "a", label: "공공기관" },
  { code: "b", label: "대기업" },
  { code: "c", label: "중소기업" },
  { code: "d", label: "스타트업" },
  { code: "e", label: "교육기관(학교, 연구소 등)" },
  { code: "f", label: "비영리기관/협회" },
  { code: "g", label: "프리랜서/개인사업자" },
  { code: "h", label: "컨설팅/심사기관" },
  { code: "i", label: "웹/앱 개발 및 제작 업체" },
  { code: "j", label: "기타" }, // 기타 = j (여기서만 j 사용)
] as const;

export const Q2_USAGE_REASONS = [
  { code: "a", label: "법적 의무/규제 준수" },
  { code: "b", label: "웹 접근성 준수 비용 절감" },
  { code: "c", label: "웹 접근성 준수 시 개발 시간 단축" },
  { code: "d", label: "웹 접근 관련 정보/가이드 습득" },
  { code: "e", label: "ESG 경영/사회적 가치 실천" },
  { code: "f", label: "콘텐츠 품질 및 SEO 개선" },
  { code: "g", label: "장애인·고령자 이용자 유입 필요" },
  { code: "h", label: "기타" },
] as const;

export const Q4_PURCHASE_WAY = [
  { code: "a", label: "개인이 직접 구독/이용" },
  { code: "b", label: "회사에서 구매해서 직원이 사용" },
  { code: "c", label: "구매 의사 없음" },
  { code: "d", label: "기타" },
] as const;

export const Q5_PRICE_MODEL = [
  { code: "a", label: "구독형(월/연)" },
  { code: "b", label: "일시결제 구매형" },
  { code: "c", label: "혼합형(구독 + 추가 사용료)" },
  { code: "d", label: "기타" },
] as const;

export const Q6_USE_METHOD = [
  { code: "a", label: "URL 입력 후 검사(웹 서비스)" },
  { code: "b", label: "브라우저 확장 프로그램" },
  { code: "c", label: "IDE 플러그인(개발 단계 검사)" },
  { code: "d", label: "사내/서버형 배포(온프렘)" },
  { code: "e", label: "API 연동(다른 시스템에서 호출)" },
  { code: "f", label: "기타" },
] as const;

export const Q7_EXTRA_AI = [
  { code: "a", label: "동영상·오디오 대체 수단 생성" },
  { code: "b", label: "접근성 텍스트 자동 보정" },
  { code: "c", label: "컨텐츠 접근성 수준·품질 자동 추천/점검" },
  { code: "d", label: "시간·비용 추정 및 관련 리포트" },
  { code: "e", label: "코드·정책/가이드 문안 생성" },
  { code: "f", label: "기타" },
] as const;
