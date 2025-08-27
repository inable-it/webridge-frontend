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
  { code: "d", label: "웹 접근성 관련 정보·기술 궁금증" },
  { code: "e", label: "ESG 경영·사회적 가치 실현 관심" },
  { code: "f", label: "콘텐츠 품질 및 SEO 개선" },
  { code: "g", label: "장애인·고령자 이용자 유입 필요" },
  { code: "h", label: "기타" },
] as const;

export const Q4_PURCHASE_WAY = [
  { code: "a", label: "개인이 직접 구매하여 사용" },
  { code: "b", label: "회사에서 구매해서 직원이 사용" },
  { code: "c", label: "구매 계획 없음" },
  { code: "d", label: "기타" },
] as const;

export const Q5_PRICE_MODEL = [
  { code: "a", label: "구독형(월/년 단위)" },
  { code: "b", label: "1회 사용권 구매형" },
  { code: "c", label: "혼합형 (기본구독 + 추가 사용권)" },
  { code: "d", label: "구매 계획 없음" },
  { code: "e", label: "기타" },
] as const;

export const Q6_USAGE_METHOD = [
  { code: "a", label: "URL 입력 후 검사 (현 방식)" },
  { code: "b", label: "브라우저 확장 프로그램 (크롬 플러그인 등)" },
  { code: "c", label: "IDE 연동 (개발 툴 안에서 바로 검사)" },
  { code: "d", label: "대시보드형 관리 도구 (프로젝트 통합 관리)" },
  { code: "e", label: "API 연동 (다른 시스템·서비스와 연결)" },
  { code: "f", label: "기타" },
] as const;

export const Q7_EXTRA_AI = [
  { code: "a", label: "동영상·오디오 대체 수단 자동 생성" },
  { code: "b", label: "색상·명도 대비 분석·수정 제안" },
  { code: "c", label: "콘텐츠 구조와 제목/레이블 점검·수정 제안" },
  { code: "d", label: "키보드 접근성 및 포커스 이동 점검" },
  { code: "e", label: "시간 제어 및 자동 변환 콘텐츠 점검" },
  { code: "f", label: "표 구조 설명 및 요약 생성" },
  { code: "g", label: "기타" },
] as const;
