/**
 * 대체텍스트 검사 결과의 준수 여부 판단 (상세 페이지 요약 개수와 필터 탭이 같은 기준을 사용)
 * - 0: 준수 (매우높음)
 * - 1: 준수 (조금높음)
 * - 2: 미준수
 * - 3: 시스템 오류 (준수로 판단할 수 없으므로 미준수 탭에 함께 표시)
 */
export const isAltTextCompliant = (compliance: number) =>
  compliance === 0 || compliance === 1;
