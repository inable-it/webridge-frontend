import NotionEmbed from "@/components/common/NotionEmbed";
import { NOTION_URLS } from "@/constants/notionUrls";

const PrivacyProcessingPage = () => {
  return (
    <div className="w-full h-screen">
      <NotionEmbed url={NOTION_URLS.PRIVACY_PROCESSING} />
    </div>
  );
};

export default PrivacyProcessingPage;
