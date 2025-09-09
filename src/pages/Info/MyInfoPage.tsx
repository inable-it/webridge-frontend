import { useEffect, useMemo, useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useGetMyInfoQuery,
  useUpdateMyNameMutation,
} from "@/features/api/userApi";
import {
  useGetTermsStatusQuery,
  useUpdateTermsAgreementMutation,
} from "@/features/api/termsApi";
import { WithdrawModal } from "@/components/common/WithdrawModal";
import { useChangePasswordMutation } from "@/features/api/authApi";

const MyInfoPage = () => {
  const { data, isLoading, error, refetch } = useGetMyInfoQuery();
  const [updateName] = useUpdateMyNameMutation();
  const [updatePassword] = useChangePasswordMutation();
  const user = data?.data;

  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // 이름 편집
  const [nameEdit, setNameEdit] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  // 비밀번호 편집(확인 입력 없음)
  const [pwdEdit, setPwdEdit] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [pwdErr, setPwdErr] = useState("");

  // 레이블-입력 연결용 id
  const nameInputId = useId();
  const pwdInputId = useId();
  const pwdErrorId = useId();

  // 약관 상태/업데이트
  const {
    data: termsStatus,
    isLoading: isTermsLoading,
    refetch: refetchTerms,
  } = useGetTermsStatusQuery();
  const [updateTerms, { isLoading: isUpdatingTerms }] =
    useUpdateTermsAgreementMutation();

  const serviceAgreed = termsStatus?.user_agreements?.service_terms ?? false;
  const privacyAgreed = termsStatus?.user_agreements?.privacy_policy ?? false;
  const marketingAgreed = termsStatus?.user_agreements?.marketing ?? false;

  const toggleDisabled = useMemo(
    () => isTermsLoading || isUpdatingTerms || !termsStatus,
    [isTermsLoading, isUpdatingTerms, termsStatus]
  );

  useEffect(() => {
    if (user && !nameEdit) setNameDraft(user.name ?? "");
  }, [user, nameEdit]);

  const handleSaveName = async () => {
    const v = nameDraft.trim();
    if (!v) return alert("이름을 입력해 주세요.");
    if (v.length >= 10) return alert("이름은 10자 미만으로 작성해 주세요.");
    try {
      await updateName({ name: v }).unwrap();
      setNameEdit(false);
      refetch();
    } catch (e) {
      alert(e || "이름 변경 중 오류가 발생했습니다.");
    }
  };

  const validatePwd = () => {
    if (newPwd.length < 8) return "비밀번호는 최소 8자 이상이어야 합니다.";
    const hasLetter = /[a-zA-Z]/.test(newPwd);
    const hasNumber = /\d/.test(newPwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPwd);
    if ([hasLetter, hasNumber, hasSpecial].filter(Boolean).length < 2) {
      return "영문/숫자/특수문자 중 2가지 이상을 포함해야 합니다.";
    }
    return "";
  };

  const handleSavePassword = async () => {
    const err = validatePwd();
    if (err) {
      setPwdErr(err);
      return;
    }
    setPwdErr("");
    try {
      await updatePassword({ new_password: newPwd }).unwrap();
      alert("비밀번호가 변경되었습니다.");
      setPwdEdit(false);
      setNewPwd("");
    } catch (e) {
      alert(e || "비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  // 마케팅 정보 수신 동의 토글
  const onToggleMarketing = async () => {
    if (toggleDisabled) return;
    const next = !marketingAgreed;
    try {
      await updateTerms({
        service_terms_agreed: serviceAgreed,
        privacy_policy_agreed: privacyAgreed,
        marketing_agreed: next, // 이 값만 변경
      }).unwrap();
      refetchTerms();
    } catch (e) {
      console.error(e);
      alert("마케팅 정보 수신 동의 상태 변경에 실패했습니다.");
    }
  };

  if (isLoading) return <div className="p-8 text-gray-700">로딩 중...</div>;
  if (error)
    return (
      <div className="p-8 text-gray-700">
        사용자 정보를 불러오는 중 오류가 발생했습니다.
      </div>
    );

  return (
    <div className="h-full bg-[#ecf3ff] p-8">
      <div className="p-6 bg-white shadow rounded-2xl">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">내 정보</h2>

        {/* 한 줄(데스크톱) 2칸 레이아웃 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* 이름 */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 bg-white border border-[#727272] rounded-xl">
            {/* label로 전환 + htmlFor 연결 */}
            <label
              htmlFor={nameEdit ? nameInputId : undefined}
              className="min-w-[56px] text-sm font-medium text-gray-700"
            >
              이름
            </label>

            {!nameEdit ? (
              <>
                <div className="flex-1 px-2 text-gray-900 truncate">
                  {user?.name}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNameEdit(true)}
                  className="border border-[#727272]"
                >
                  ✏️ 이름 변경
                </Button>
              </>
            ) : (
              <div className="flex items-center w-full gap-2">
                <Input
                  id={nameInputId}
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="h-10 max-w-[240px]"
                  placeholder="새 이름"
                  required
                  maxLength={9} // 10자 미만 제약 보조
                  aria-describedby={undefined}
                />
                <Button size="sm" onClick={handleSaveName}>
                  저장
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNameEdit(false);
                    setNameDraft(user?.name ?? "");
                  }}
                >
                  취소
                </Button>
              </div>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 bg-white border border-[#727272] rounded-xl">
            {/* label로 전환 + htmlFor 연결 */}
            <label
              htmlFor={pwdEdit ? pwdInputId : undefined}
              className="min-w-[72px] text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>

            {!pwdEdit ? (
              <>
                <div className="flex-1 px-2 text-gray-900">**********</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPwdEdit(true)}
                  className="border border-[#727272]"
                >
                  ✏️ 비밀번호 변경
                </Button>
              </>
            ) : (
              <div className="flex items-center w-full gap-2">
                <Input
                  id={pwdInputId}
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="h-10 max-w-[260px]"
                  placeholder="새 비밀번호"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  aria-describedby={pwdErr ? pwdErrorId : undefined}
                />
                <Button
                  size="sm"
                  onClick={handleSavePassword}
                  disabled={!newPwd}
                >
                  저장
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPwdEdit(false);
                    setNewPwd("");
                    setPwdErr("");
                  }}
                >
                  취소
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 비밀번호 에러는 SR에 연결 */}
        {pwdErr && (
          <p id={pwdErrorId} className="mt-2 text-sm text-red-600" role="alert">
            {pwdErr}
          </p>
        )}
      </div>

      {/* ▼ 왼쪽 텍스트+토글, 오른쪽 탈퇴 링크 */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">마케팅 정보 수신 동의</span>
          <button
            type="button"
            role="switch"
            aria-checked={marketingAgreed}
            onClick={onToggleMarketing}
            disabled={toggleDisabled}
            className={[
              "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
              marketingAgreed ? "bg-blue-600" : "bg-gray-700",
              toggleDisabled
                ? "opacity-60 cursor-not-allowed"
                : "cursor-pointer",
            ].join(" ")}
            title={
              isUpdatingTerms
                ? "업데이트 중..."
                : marketingAgreed
                ? "해제하기"
                : "동의하기"
            }
          >
            <span
              className={[
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                marketingAgreed ? "translate-x-5" : "translate-x-1",
              ].join(" ")}
            />
          </button>
        </div>

        <button
          onClick={() => setWithdrawOpen(true)}
          className="text-sm text-blue-600 hover:underline"
        >
          회원 탈퇴하기
        </button>
      </div>

      <WithdrawModal open={withdrawOpen} onOpenChange={setWithdrawOpen} />
    </div>
  );
};

export default MyInfoPage;
