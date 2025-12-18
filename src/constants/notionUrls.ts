export const NOTION_URLS = {
  // 약관 관련 URL들
  SERVICE_TERMS:
    "https://urgent-donkey.super.site/%ec%84%9c%eb%b9%84%ec%8a%a4%ec%9d%b4%ec%9a%a9%ec%95%bd%ea%b4%80",
  PRIVACY_POLICY:
    "https://urgent-donkey.super.site/%ea%b0%9c%ec%9d%b8%ec%a0%95%eb%b3%b4%ec%88%98%ec%a7%91-%eb%b0%8f-%ec%9d%b4%ec%9a%a9-%eb%8f%99%ec%9d%98",
  MARKETING_TERMS:
    "https://urgent-donkey.super.site/%eb%a7%88%ec%bc%80%ed%8c%85-%eb%aa%a9%ec%a0%81%ec%9d%98-%ea%b0%9c%ec%9d%b8%ec%a0%95%eb%b3%b4-%ec%88%98%ec%a7%91-%eb%b0%8f-%ec%9d%b4%ec%9a%a9%ec%88%98%ec%8b%a0-%eb%8f%99%ec%9d%98%ec%97%90-%eb%8c%80%ed%95%9c-%eb%8f%99%ec%9d%98",
  PRIVACY_PROCESSING:
    "https://urgent-donkey.super.site/%ea%b0%9c%ec%9d%b8%ec%a0%95%eb%b3%b4%ec%b2%98%eb%a6%ac%ec%a7%80%ec%b9%a8",
} as const;

// 타입 안전성을 위한 타입 정의
export type NotionUrlKey = keyof typeof NOTION_URLS;
