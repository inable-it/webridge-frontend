import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const FeedbackPage = () => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  return (
    <div className="p-8 bg-[#ecf3ff] h-full">
      <div className="mx-auto">
        <h2 className="mb-6 text-lg font-semibold">
          WEBridge 사용 후 느낀 점을 남겨주세요.
        </h2>

        <div className="p-6 space-y-4 bg-white border rounded-lg">
          {/* 평점 영역 */}
          <div>
            <p className="mb-2 font-semibold">평점</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <Star
                  key={num}
                  className={`w-6 h-6 cursor-pointer ${
                    rating >= num ? "text-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => setRating(num)}
                />
              ))}
            </div>
          </div>

          {/* 의견 작성 영역 */}
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="자유로운 의견을 500자 이내로 남겨주세요!"
              maxLength={500}
              rows={5}
              className="w-full px-4 pt-4 text-sm border border-t rounded-lg resize-none"
            />
          </div>

          {/* 하단 등록 버튼 */}
          <div className="flex items-center justify-end">
            <span className="mr-2 text-sm text-gray-400">
              {text.length} / 500
            </span>
            <Button className="bg-[#0055FF] text-white hover:bg-[#0040CC]">
              등록하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FeedbackPage;
