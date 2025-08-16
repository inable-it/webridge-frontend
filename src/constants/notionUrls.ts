export const NOTION_URLS = {
  // 약관 관련 URL들
  SERVICE_TERMS:
    "https://poised-split-457.notion.site/23263c8cc2e6806b8b3cfdda8c2ac402?source=copy_link",
  PRIVACY_POLICY:
    "https://poised-split-457.notion.site/23263c8cc2e6800b9a72f30f0bc3106b?source=copy_link",
  MARKETING_TERMS:
    "https://poised-split-457.notion.site/23263c8cc2e6805fb899c4bc791c6534?source=copy_link",

  // 하단 링크용 URL들
  PRIVACY_PROCESSING: "https://www.notion.so/23263c8cc2e6807cbbe6e2f12253517d",
  SERVICE_TERMS_FOOTER:
    "https://www.notion.so/23263c8cc2e6806b8b3cfdda8c2ac402",
} as const;

// 타입 안전성을 위한 타입 정의
export type NotionUrlKey = keyof typeof NOTION_URLS;
