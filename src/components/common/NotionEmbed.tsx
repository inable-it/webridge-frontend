interface NotionEmbedProps {
  url: string;
}

const NotionEmbed = ({ url }: NotionEmbedProps) => {
  return (
    <iframe
      src={url}
      style={{ width: "100%", height: "100vh", border: "none" }}
      allowFullScreen
      title="Notion Page"
    />
  );
};

export default NotionEmbed;
