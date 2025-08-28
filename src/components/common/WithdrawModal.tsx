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

  // 성공 완료 화면 전환용
  const [done, setDone] = useState(false);

  const handleWithdraw = async () => {
    try {
      await deleteUserAccount().unwrap();

      // 1) 토큰 제거
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // 2) 사용자 정보 초기화
      dispatch(clearUser());
      // 3) 완료 화면으로 전환 (토스트 X)
      setDone(true);
    } catch (err) {
      // 실패는 그대로 토스트 알림 유지
      toast({
        title: "탈퇴 실패",
        description: "다시 시도해 주세요.",
        variant: "destructive",
      });
    }
  };

  const goHome = () => {
    window.location.href = "/";
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        // 모달 닫힐 때 상태 초기화
        if (!v) {
          setAgree(false);
          setDone(false);
        }
        onOpenChange(v);
      }}
    >
      {!done ? (
        // 1) 기본 확인 모달
        <DialogContent className="sm:max-w-[480px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-center">
              떠나신다니 아쉬워요 😢
            </DialogTitle>
            <DialogDescription className="text-sm text-center text-muted-foreground">
              탈퇴하기 전 아래 주의 사항을 확인해 주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 space-y-2 text-sm text-gray-700 border rounded-md bg-gray-50">
            <p>* 탈퇴 후 계정 복구가 불가능합니다.</p>
            <p>* 보유하고 있던 서비스 이용 정보가 삭제됩니다.</p>
            <p>* 접근성 기록이 전부 삭제되며 복구가 불가능합니다.</p>
            <p>* 작성한 피드백 게시물은 삭제되지 않을 수 있습니다.</p>
          </div>

          <div className="flex items-center mt-4 space-x-2">
            <Checkbox
              id="agree"
              checked={agree}
              onCheckedChange={(v) => setAgree(!!v)}
            />
            <label htmlFor="agree" className="text-sm text-gray-700">
              주의사항을 모두 확인하였습니다.
            </label>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button onClick={handleWithdraw} disabled={!agree || isLoading}>
              {isLoading ? "처리 중..." : "회원 탈퇴"}
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : (
        // 2) 성공 완료 모달
        <DialogContent className="sm:max-w-[420px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-center">
              탈퇴가 완료되었습니다
            </DialogTitle>
            <DialogDescription className="text-center text-gray-700">
              그동안 이용해 주셔서 감사합니다.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-2">
            <Button className="w-full" onClick={goHome}>
              홈으로 이동
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};
