import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSocialTermsAgreementMutation } from "@/features/api/authApi";
import { setUser } from "@/features/store/userSlice";
import { useDispatch } from "react-redux";
import { toast } from "@/hooks/use-toast";

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

  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (id === "allAgree") {
      setForm((prev) => ({
        ...prev,
        allAgree: checked,
        ageAgree: checked,
        serviceAgree: checked,
        privacyAgree: checked,
        marketingAgree: checked,
      }));
    } else {
      setForm((prev) => {
        const newForm = { ...prev, [id]: checked };
        // 개별 체크박스가 모두 선택되었는지 확인
        newForm.allAgree =
          newForm.ageAgree &&
          newForm.serviceAgree &&
          newForm.privacyAgree &&
          newForm.marketingAgree;
        return newForm;
      });
    }
  };

  const openNotionPage = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const canSubmit = () => {
    return form.ageAgree && form.serviceAgree && form.privacyAgree;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.ageAgree || !form.serviceAgree || !form.privacyAgree) {
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
      // 유저정보 저장
      dispatch(setUser(response.user));

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

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        {/* 제목 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.svg" alt="Logo" className="w-12 h-12" />
            <span className="text-2xl font-bold text-blue-500">회원가입</span>
          </div>
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
          <div className="flex items-center gap-2">
            <Checkbox
              id="allAgree"
              checked={form.allAgree}
              onCheckedChange={(checked) =>
                handleCheckboxChange("allAgree", checked === true)
              }
            />
            <Label htmlFor="allAgree" className="text-sm text-gray-700">
              모두 동의합니다.
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="ageAgree"
              checked={form.ageAgree}
              onCheckedChange={(checked) =>
                handleCheckboxChange("ageAgree", checked === true)
              }
            />
            <Label htmlFor="ageAgree" className="text-sm text-gray-700">
              (필수) 만 14세 이상입니다.
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="serviceAgree"
              checked={form.serviceAgree}
              onCheckedChange={(checked) =>
                handleCheckboxChange("serviceAgree", checked === true)
              }
            />
            <Label htmlFor="serviceAgree" className="text-sm text-gray-700">
              (필수)
              <button
                type="button"
                onClick={() =>
                  openNotionPage(
                    "https://poised-split-457.notion.site/23263c8cc2e6806b8b3cfdda8c2ac402?source=copy_link"
                  )
                }
                className="mx-1 text-blue-600 underline hover:text-blue-800"
              >
                서비스 이용약관
              </button>
              에 동의합니다.
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="privacyAgree"
              checked={form.privacyAgree}
              onCheckedChange={(checked) =>
                handleCheckboxChange("privacyAgree", checked === true)
              }
            />
            <Label htmlFor="privacyAgree" className="text-sm text-gray-700">
              (필수)
              <button
                type="button"
                onClick={() =>
                  openNotionPage(
                    "https://poised-split-457.notion.site/23263c8cc2e6800b9a72f30f0bc3106b?source=copy_link"
                  )
                }
                className="mx-1 text-blue-600 underline hover:text-blue-800"
              >
                개인정보 수집 및 이용
              </button>
              에 동의합니다.
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="marketingAgree"
              checked={form.marketingAgree}
              onCheckedChange={(checked) =>
                handleCheckboxChange("marketingAgree", checked === true)
              }
            />
            <Label htmlFor="marketingAgree" className="text-sm text-gray-700">
              (선택)
              <button
                type="button"
                onClick={() =>
                  openNotionPage(
                    "https://poised-split-457.notion.site/23263c8cc2e6805fb899c4bc791c6534?source=copy_link"
                  )
                }
                className="mx-1 text-blue-600 underline hover:text-blue-800"
              >
                마케팅 목적의 개인정보 수집 및 이용
              </button>
              에 동의합니다.
            </Label>
          </div>
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
