import NotionEmbed from "@/components/common/NotionEmbed";
import { NOTION_URLS } from "@/constants/notionUrls";

const ServiceTermsPage = () => {
  return (
    <div className="w-full h-screen">
      <NotionEmbed url={NOTION_URLS.SERVICE_TERMS} />
    </div>
  );
};

export default ServiceTermsPage;
