import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4 py-12 text-center bg-gray-50">
      <Button
        variant="outline"
        onClick={() => navigate("/scan")}
        className="flex items-center gap-2 px-6 py-3 font-semibold text-blue-600 transition border-2 border-blue-500 rounded-full hover:bg-blue-50"
      >
        <img src="/logo.svg" alt="icon" className="w-6 h-6" />
        <span>AI 웹 접근성 검사</span>
      </Button>

      <h1 className="mb-4 text-6xl font-bold text-gray-900">WEBridge</h1>
      <p className="text-lg text-gray-700">
        접근성을 지키는 가장 빠른 방법. <br />
        <span className="font-semibold text-black">
          AI가 실시간으로 점검하고 해결하는 WEBridge.
        </span>
      </p>
    </div>
  );
};

export default HomePage;
