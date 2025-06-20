import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export const FeedbackPage = () => {
  return (
    <div className="p-8 bg-[#edf3fe] h-full">
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-lg font-semibold">평점</h2>
        <div className="flex items-center gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-6 h-6 text-gray-300" />
          ))}
        </div>
        <textarea
          rows={6}
          placeholder="자유로운 의견을 500자 이내로 남겨주세요!"
          className="w-full p-4 border rounded-lg resize-none"
        />
        <div className="flex justify-end mt-2">
          <span className="mr-2 text-sm text-gray-400">12 / 500</span>
          <Button className="text-white bg-blue-500 hover:bg-blue-600">
            등록
          </Button>
        </div>
      </div>
    </div>
  );
};
