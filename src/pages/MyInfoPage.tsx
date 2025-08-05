import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGetMyInfoQuery } from "@/features/api/userApi";
import { WithdrawModal } from "@/components/common/WithdrawModal";

const MyInfoPage = () => {
  const { data, isLoading, error } = useGetMyInfoQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const user = data?.data;

  if (isLoading) return <div className="p-8">로딩 중...</div>;
  if (error)
    return (
      <div className="p-8">사용자 정보를 불러오는 중 오류가 발생했습니다.</div>
    );

  return (
    <div className="p-8 bg-[#ecf3ff] h-full">
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-6 text-lg font-semibold">내 정보</h2>
        <div className="flex gap-6">
          <div className="flex items-center justify-between flex-1 p-4 border rounded-lg">
            <span className="font-medium">이름</span>
            <span>{user?.name}</span>
            <Button variant="outline">✏️ 변경</Button>
          </div>
          <div className="flex items-center justify-between flex-1 p-4 border rounded-lg">
            <span className="font-medium">이메일</span>
            <span>{user?.email}</span>
            <Button variant="outline">✏️ 변경</Button>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => setModalOpen(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            회원 탈퇴하기
          </button>
        </div>
      </div>

      <WithdrawModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
};
export default MyInfoPage;
