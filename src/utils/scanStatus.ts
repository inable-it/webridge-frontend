export const getStatusDisplay = (scan: any) => {
  switch (scan.status) {
    case "completed":
      return { color: "text-[#1d8163]", text: scan.status_display };
    case "processing":
      return {
        color: "text-blue-600",
        text: `진행중 (${Math.round(scan.completion_percentage || 0)}%)`,
      };
    case "pending":
      return { color: "text-yellow-600", text: "대기중 (0%)" };
    case "failed":
      return { color: "text-red-600", text: scan.status_display };
    default:
      return { color: "text-gray-600", text: scan.status_display };
  }
};
