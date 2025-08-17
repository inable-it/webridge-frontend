import NotionEmbed from "@/components/common/NotionEmbed";
import { NOTION_URLS } from "@/constants/notionUrls";

const PrivacyPolicyPage = () => {
  return (
    <div className="w-full h-screen">
      <NotionEmbed url={NOTION_URLS.PRIVACY_POLICY} />
    </div>
  );
};

export default PrivacyPolicyPage;
