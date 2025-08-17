export const NOTION_URLS = {
  // 약관 관련 URL들
  SERVICE_TERMS:
    "https://successive-stingray.super.site/%ec%84%9c%eb%b9%84%ec%8a%a4-%ec%9d%b4%ec%9a%a9%ec%95%bd%ea%b4%80",
  PRIVACY_POLICY:
    "https://successive-stingray.super.site/%ea%b0%9c%ec%9d%b8%ec%a0%95%eb%b3%b4%ec%88%98%ec%a7%91-%eb%b0%8f-%ec%9d%b4%ec%9a%a9-%eb%8f%99%ec%9d%98",
  MARKETING_TERMS:
    "https://successive-stingray.super.site/%ea%b0%9c%ec%9d%b8%ec%a0%95%eb%b3%b4%ec%88%98%ec%a7%91-%eb%b0%8f-%ec%9d%b4%ec%9a%a9-%eb%8f%99%ec%9d%98",
  PRIVACY_PROCESSING:
    "https://successive-stingray.super.site/%ea%b0%9c%ec%9d%b8%ec%a0%95%eb%b3%b4%ec%b2%98%eb%a6%ac%ec%a7%80%ec%b9%a8",
} as const;

// 타입 안전성을 위한 타입 정의
export type NotionUrlKey = keyof typeof NOTION_URLS;
