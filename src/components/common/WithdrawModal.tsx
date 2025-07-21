import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useDeleteUserAccountMutation } from "@/features/api/userApi";
import { toast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { clearUser } from "@/features/store/userSlice";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WithdrawModal = ({ open, onOpenChange }: WithdrawModalProps) => {
  const [agree, setAgree] = useState(false);
  const [deleteUserAccount, { isLoading }] = useDeleteUserAccountMutation();
  const dispatch = useDispatch();

  const handleWithdraw = async () => {
    try {
      await deleteUserAccount().unwrap();

      // 1. 토큰 제거
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // 2. 사용자 정보 초기화
      dispatch(clearUser());

      // 3. 토스트 알림
      toast({
        title: "회원 탈퇴 완료",
        description: "그동안 이용해주셔서 감사합니다.",
      });

      // 4. 홈으로 이동
      window.location.href = "/";
    } catch (err) {
      toast({
        title: "탈퇴 실패",
        description: "다시 시도해 주세요.",
        variant: "destructive",
      });
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-center">
            떠나신다니 아쉬워요 😢
          </DialogTitle>
          <DialogDescription className="text-sm text-center text-muted-foreground">
            탈퇴하기 전 아래 주의 사항을 확인해 주세요.
          </DialogDescription>
        </DialogHeader>

        {/* 주의사항 */}
        <div className="p-4 space-y-2 text-sm text-gray-700 border rounded-md bg-gray-50">
          <p>* 탈퇴 후 계정 복구가 불가능합니다.</p>
          <p>* 보유하고 있던 서비스 이용 정보가 삭제됩니다.</p>
          <p>* 접근성 기록이 전부 삭제되며 복구가 불가능합니다.</p>
          <p>* 작성한 피드백 게시물은 삭제되지 않을 수 있습니다.</p>
        </div>

        {/* 체크박스 */}
        <div className="flex items-center mt-4 space-x-2">
          <Checkbox
            id="agree"
            checked={agree}
            onCheckedChange={(v) => setAgree(!!v)}
          />
          <label htmlFor="agree" className="text-sm text-muted-foreground">
            주의사항을 모두 확인하였습니다.
          </label>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleWithdraw} disabled={!agree || isLoading}>
            회원 탈퇴
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
