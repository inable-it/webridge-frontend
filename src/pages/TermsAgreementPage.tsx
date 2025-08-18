import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSocialTermsAgreementMutation } from "@/features/api/authApi";
import { setUser } from "@/features/store/userSlice";
import { useDispatch } from "react-redux";
import { toast } from "@/hooks/use-toast";
import { TERMS_CONFIG, type TermConfig } from "@/constants/termsConfig";

// 이 페이지 전용 초안 저장 키
const DRAFT_KEY = "terms_agreement_draft_v1";

const TermsAgreementPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = location.state?.userEmail || "";

  const [form, setForm] = useState({
    allAgree: false,
    ageAgree: false,
    serviceAgree: false,
    privacyAgree: false,
    marketingAgree: false,
  });

  const [socialTermsAgreement, { isLoading }] =
    useSocialTermsAgreementMutation();

  // ---- 저장/복원 헬퍼 ----
  const saveDraftNow = (draft = form) => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ form: draft }));
    } catch {}
  };

  const go = (to: string) => {
    // 이동 직전 현재 상태 저장
    saveDraftNow();
    navigate(to);
  };

  // 마운트 시 복원
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.form) {
        setForm((prev) => ({ ...prev, ...saved.form }));
      }
    } catch {}
  }, []);

  // 변경될 때마다 자동 저장
  useEffect(() => {
    saveDraftNow(form);
  }, [form]);

  // 체크박스 변경
  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (id === "allAgree") {
      setForm((prev) => {
        const next = {
          ...prev,
          allAgree: checked,
          ageAgree: checked,
          serviceAgree: checked,
          privacyAgree: checked,
          marketingAgree: checked,
        };
        saveDraftNow(next);
        return next;
      });
    } else {
      setForm((prev) => {
        const next = { ...prev, [id]: checked } as typeof prev &
          Record<string, boolean>;
        next.allAgree =
          next.ageAgree &&
          next.serviceAgree &&
          next.privacyAgree &&
          next.marketingAgree;
        saveDraftNow(next);
        return next;
      });
    }
  };

  const canSubmit = () =>
    form.ageAgree && form.serviceAgree && form.privacyAgree;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit()) {
      alert("필수 약관에 동의해야 계속할 수 있습니다.");
      return;
    }

    try {
      const response = await socialTermsAgreement({
        service_terms_agreed: form.serviceAgree,
        age_verification_agreed: form.ageAgree,
        privacy_policy_agreed: form.privacyAgree,
        marketing_agreed: form.marketingAgree,
      }).unwrap();

      dispatch(setUser(response.user));
      sessionStorage.removeItem(DRAFT_KEY); // 완료 시 초안 제거

      toast({
        title: "로그인 성공",
        description: `${response.user.name}님 환영합니다!`,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("약관 동의 처리 중 오류:", error);
      alert("약관 동의 처리 중 오류가 발생했습니다.");
    }
  };

  // ---- 약관 체크박스 렌더러 (요청하신 스타일) ----
  const renderTermsCheckbox = (term: TermConfig) => (
    <div key={term.id} className="flex items-start gap-3">
      <Checkbox
        id={term.id}
        checked={form[term.id as keyof typeof form] as boolean}
        onCheckedChange={(checked) =>
          handleCheckboxChange(term.id, checked === true)
        }
        className="mt-0.5 w-5 h-5 rounded border-gray-300
                   data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600
                   data-[state=checked]:text-white"
      />

      <Label htmlFor={term.id} className="text-[15px] text-gray-800">
        {term.id === "ageAgree" ? (
          // 밑줄만 (색상 제거)
          <>
            (필수){" "}
            <span className="underline underline-offset-2">만 14세 이상</span>
            입니다.
          </>
        ) : (
          <>
            {term.label}
            {term.linkText && (
              <>
                {" "}
                <button
                  type="button"
                  onClick={() => go(term.route!)} // 이동 직전 저장 후 라우팅
                  className="underline underline-offset-2" // 밑줄만
                >
                  {term.linkText}
                </button>
                에 동의합니다.
              </>
            )}
          </>
        )}
      </Label>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        {/* 제목 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">회원가입</h1>
        </div>

        {/* 이메일 (읽기 전용) */}
        <div className="space-y-1 text-left">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            이메일
          </Label>
          <Input
            id="email"
            type="email"
            value={userEmail}
            readOnly
            className="w-full h-12 bg-gray-50"
            placeholder="000@000.000"
          />
        </div>

        {/* 약관 동의 체크박스들 */}
        <div className="space-y-3">
          {/* 전체 동의 */}
          <div className="flex items-center gap-2 my-6">
            <Checkbox
              id="allAgree"
              checked={form.allAgree}
              onCheckedChange={(checked) =>
                handleCheckboxChange("allAgree", checked === true)
              }
              className="w-5 h-5 rounded border-gray-300
                         data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600
                         data-[state=checked]:text-white"
            />
            <Label htmlFor="allAgree" className="text-sm text-gray-800">
              모두 동의합니다.
            </Label>
          </div>

          {/* 회색 구분선 */}
          <div className="h-px my-4 bg-gray-200" />

          {/* 개별 약관들 (TERMS_CONFIG 기반) */}
          {TERMS_CONFIG.map(renderTermsCheckbox)}
        </div>

        {/* 회원가입 버튼 */}
        <Button
          type="submit"
          disabled={!canSubmit() || isLoading}
          className={`w-full h-12 text-white ${
            canSubmit()
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {isLoading ? "처리 중..." : "회원가입"}
        </Button>
      </form>
    </div>
  );
};

export default TermsAgreementPage;
