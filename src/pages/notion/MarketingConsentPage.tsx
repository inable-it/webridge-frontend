import NotionEmbed from "@/components/common/NotionEmbed";
import { NOTION_URLS } from "@/constants/notionUrls";

const MarketingConsentPage = () => {
  return (
    <div className="w-full h-screen">
      <NotionEmbed url={NOTION_URLS.MARKETING_TERMS} />
    </div>
  );
};

export default MarketingConsentPage;
