import { Button } from "@/components/ui/button";

export const MyInfoPage = () => {
  return (
    <div className="p-8 bg-[#edf3fe] h-full">
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-6 text-lg font-semibold">내 정보</h2>
        <div className="flex gap-6">
          <div className="flex items-center justify-between flex-1 p-4 border rounded-lg">
            <span className="font-medium">이름</span>
            <Button variant="outline" className="flex items-center gap-2">
              ✏️ 변경
            </Button>
          </div>
          <div className="flex items-center justify-between flex-1 p-4 border rounded-lg">
            <span className="font-medium">비밀번호</span>
            <Button variant="outline" className="flex items-center gap-2">
              ✏️ 변경
            </Button>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <a href="#" className="text-sm text-blue-600">
            회원 탈퇴하기
          </a>
        </div>
      </div>
    </div>
  );
};
