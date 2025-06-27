import { Button } from "@/components/ui/button";
import { useGetMyInfoQuery } from "@/features/api/userApi";

export const MyInfoPage = () => {
  const { data, isLoading, error } = useGetMyInfoQuery(); // 사용자 정보 가져오기

  // 로딩 또는 에러 처리
  if (isLoading) {
    return <div className="p-8">로딩 중...</div>;
  }

  if (error) {
    return <div className="p-8">사용자 정보를 불러오는 중 오류가 발생했습니다.</div>;
  }

  // 사용자 데이터
  const user = data?.data;

  return (
      <div className="p-8 bg-[#ecf3ff] h-full">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-6 text-lg font-semibold">내 정보</h2>
          <div className="flex gap-6">
            {/* 이름 */}
            <div className="flex items-center justify-between flex-1 p-4 border rounded-lg">
              <span className="font-medium">이름</span>
              <span>{user?.name}</span>
              <Button variant="outline" className="flex items-center gap-2">
                ✏️ 변경
              </Button>
            </div>

            {/* 이메일 */}
            <div className="flex items-center justify-between flex-1 p-4 border rounded-lg">
              <span className="font-medium">이메일</span>
              <span>{user?.email}</span>
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