import { useState, useEffect } from "react";
import {
  useRegisterMutation,
  useRequestEmailVerificationMutation,
  useCheckEmailVerificationMutation,
  useSocialLoginMutation,
} from "@/features/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { setUser } from "@/features/store/userSlice";
import { NOTION_URLS } from "@/constants/notionUrls";
import {
  TERMS_CONFIG,
  getRequiredTermIds,
  type TermConfig,
} from "@/constants/termsConfig";

// 초기 상태 정의
const INITIAL_FORM_STATE = {
  name: "",
  email: "",
  password: "",
  allAgree: false,
  ageAgree: false,
  serviceAgree: false,
  privacyAgree: false,
  marketingAgree: false,
};

const INITIAL_ERRORS_STATE = {
  name: "",
  email: "",
  password: "",
};

const SignupPageContent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 상태 관리
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState(INITIAL_ERRORS_STATE);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  // API 훅
  const [register, { isLoading }] = useRegisterMutation();
  const [requestEmailVerification, { isLoading: isRequestingVerification }] =
    useRequestEmailVerificationMutation();
  const [checkEmailVerification] = useCheckEmailVerificationMutation();
  const [socialLogin] = useSocialLoginMutation();

  // 유효성 검사 함수들
  const validators = {
    name: (name: string): string => {
      if (!name.trim()) return "이름을 입력해주세요.";
      if (name.length >= 10) return "이름은 10자 미만으로 작성해 주세요.";
      return "";
    },

    email: (email: string): string => {
      if (!email.trim()) return "이메일을 입력해주세요.";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return "유효한 이메일 주소를 입력해주세요.";
      return "";
    },

    password: (password: string): string => {
      if (!password) return "비밀번호를 입력해주세요.";
      if (password.length < 8) return "비밀번호는 최소 8자 이상이어야 합니다.";

      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      const criteria = [hasLetter, hasNumber, hasSpecial].filter(
        Boolean
      ).length;
      if (criteria < 2) {
        return "비밀번호에는 영문자, 숫자, 특수문자 중 두 가지 이상이 포함되어야 합니다.";
      }
      return "";
    },
  };

  // 페이지 포커스 시 이메일 인증 상태 확인
  useEffect(() => {
    const handleFocus = async () => {
      if (form.email && !emailVerified && !isGoogleUser) {
        try {
          await checkEmailVerification({ email: form.email }).unwrap();
          setEmailVerified(true);
        } catch {
          // 인증되지 않음 (정상)
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [form.email, emailVerified, isGoogleUser, checkEmailVerification]);

  // 유틸리티 함수들
  const openNotionPage = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const resetEmailVerification = () => {
    setEmailVerified(false);
    setIsGoogleUser(false);
  };

  const handleTokenStorage = (access: string, refresh: string) => {
    if (access && access.trim() !== "") {
      localStorage.setItem("accessToken", access);
    }
    if (refresh && refresh.trim() !== "") {
      localStorage.setItem("refreshToken", refresh);
    }
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));

    // 실시간 유효성 검사
    const validator = validators[id as keyof typeof validators];
    const error = validator ? validator(value) : "";
    setErrors((prev) => ({ ...prev, [id]: error }));

    // 이메일이 변경되면 인증 상태 초기화
    if (id === "email") {
      resetEmailVerification();
    }
  };

  // 체크박스 변경 핸들러
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
        // 모든 개별 체크박스가 선택되었는지 확인
        newForm.allAgree =
          newForm.ageAgree &&
          newForm.serviceAgree &&
          newForm.privacyAgree &&
          newForm.marketingAgree;
        return newForm;
      });
    }
  };

  // 이메일 인증 처리
  const handleEmailVerification = async () => {
    const emailError = validators.email(form.email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    try {
      await requestEmailVerification({ email: form.email }).unwrap();
      setShowModal(true);
    } catch (err: any) {
      const errorMessage =
        err?.status === 400
          ? "이미 가입된 이메일입니다."
          : "이메일 인증 요청 중 오류가 발생했습니다.";
      setErrors((prev) => ({ ...prev, email: errorMessage }));
    }
  };

  // Google 로그인 핸들러
  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        localStorage.setItem("accessToken", tokenResponse.access_token);
        const result = await socialLogin({
          provider: "google",
          access_token: tokenResponse.access_token,
        });

        if ("data" in result) {
          const response = result.data;

          // response.status 또는 response.message로 분기 처리
          if (
            response &&
            (response.status === "terms_agreement_required" ||
              response.message === "서비스 이용을 위해 약관 동의가 필요합니다.")
          ) {
            // 202: 약관 동의가 필요한 사용자
            console.log("소셜 로그인 성공 (202) - 약관 동의 필요", response);

            // 202 응답에도 토큰이 있을 수 있으므로 저장
            if (response.access && response.access.trim() !== "") {
              localStorage.setItem("accessToken", response.access);
            }
            if (response.refresh && response.refresh.trim() !== "") {
              localStorage.setItem("refreshToken", response.refresh);
            }

            navigate("/terms-agreement", {
              state: {
                userEmail: response.user_info?.email || "",
                userName: response.user_info?.name || "",
                userId: response.user_id,
                message:
                  response.message ||
                  "서비스 이용을 위해 약관 동의가 필요합니다.",
                profileImage: response.user_info?.profile_image || null,
                provider: response.user_info?.provider || "google",
                isNew: response.is_new || false,
              },
            });
          } else if (response) {
            // 200: 약관 동의가 완료된 사용자
            console.log("소셜 로그인 성공 (200)", response);
            handleTokenStorage(response.access, response.refresh);
            dispatch(setUser(response.user));
            navigate("/dashboard");
          }
        } else if ("error" in result) {
          // 실제 에러 (400 등)
          const error = result.error as any;
          if (error?.status === 400) {
            console.error(
              "클라이언트 에러:",
              error?.data?.message || "잘못된 요청입니다."
            );
            alert("로그인 요청에 문제가 있습니다. 다시 시도해주세요.");
          } else {
            console.error("기타 에러:", error);
            alert("Google 로그인 중 오류가 발생했습니다.");
          }
        }
      } catch (error: any) {
        console.error("소셜 로그인 예외:", error);
        alert("Google 로그인 중 예외가 발생했습니다.");
      }
    },
    onError: () => {
      console.log("Google Login 실패");
      alert("Google 로그인에 실패했습니다.");
    },
  });

  // 폼 제출 가능 여부 확인
  const canSubmit = () => {
    const hasValidForm =
      !errors.name &&
      !errors.email &&
      !errors.password &&
      form.name &&
      form.email &&
      form.password;

    // 필수 약관 동의 확인
    const requiredTermIds = getRequiredTermIds();
    const hasRequiredAgreements = requiredTermIds.every(
      (termId) => form[termId as keyof typeof form] as boolean
    );

    const hasEmailVerification = emailVerified || isGoogleUser;

    return hasValidForm && hasRequiredAgreements && hasEmailVerification;
  };

  // 회원가입 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 최종 유효성 검사
    const validationErrors = {
      name: validators.name(form.name),
      email: validators.email(form.email),
      password: validators.password(form.password),
    };

    if (Object.values(validationErrors).some((error) => error)) {
      setErrors(validationErrors);
      return;
    }

    // 필수 약관 동의 확인
    const requiredTermIds = getRequiredTermIds();
    const hasRequiredAgreements = requiredTermIds.every(
      (termId) => form[termId as keyof typeof form] as boolean
    );

    if (!hasRequiredAgreements) {
      alert("필수 약관에 동의해야 가입할 수 있습니다.");
      return;
    }

    if (!emailVerified && !isGoogleUser) {
      alert("이메일 인증을 완료해주세요.");
      return;
    }

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        password2: form.password,
        service_terms_agreed: form.serviceAgree,
        age_verification_agreed: form.ageAgree,
        privacy_policy_agreed: form.privacyAgree,
        marketing_agreed: form.marketingAgree,
      }).unwrap();

      alert("회원가입 성공!");
      navigate("/login");
    } catch (err: any) {
      console.error("회원가입 실패", err);
      if (err?.status === 400 && err?.data?.email) {
        setErrors((prev) => ({ ...prev, email: "이미 가입된 이메일입니다." }));
      } else {
        alert("회원가입 중 오류가 발생했습니다.");
      }
    }
  };

  // 약관 체크박스 렌더링
  const renderTermsCheckbox = (term: TermConfig) => (
    <div key={term.id} className="flex items-center gap-2">
      <Checkbox
        id={term.id}
        checked={form[term.id as keyof typeof form] as boolean}
        onCheckedChange={(checked) =>
          handleCheckboxChange(term.id, checked === true)
        }
      />
      <Label htmlFor={term.id} className="text-sm text-gray-700">
        {term.label}
        {term.linkText && (
          <button
            type="button"
            onClick={() => openNotionPage(term.url!)}
            className="mx-1 text-blue-600 underline hover:text-blue-800"
          >
            {term.linkText}
          </button>
        )}
        {term.linkText && " 에 동의합니다."}
      </Label>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        {/* 제목 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
        </div>

        {/* 이름 입력 */}
        <div className="space-y-1 text-left">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            이름<span className="ml-1 text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="이름"
            value={form.name}
            onChange={handleInputChange}
            className={`w-full h-12 ${errors.name ? "border-red-500" : ""}`}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* 이메일 입력 */}
        <div className="space-y-1 text-left">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            이메일<span className="ml-1 text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              placeholder="이메일"
              value={form.email}
              onChange={handleInputChange}
              className={`flex-1 h-12 ${errors.email ? "border-red-500" : ""}`}
            />
            <Button
              type="button"
              onClick={handleEmailVerification}
              disabled={
                isRequestingVerification ||
                !form.email ||
                emailVerified ||
                isGoogleUser
              }
              className="h-12 text-white bg-blue-500 border-0 whitespace-nowrap hover:bg-blue-600"
            >
              {isRequestingVerification
                ? "인증 중..."
                : emailVerified || isGoogleUser
                ? "인증완료"
                : "이메일 인증"}
            </Button>
          </div>

          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}

          {(emailVerified || isGoogleUser) && !errors.email && (
            <p className="text-sm text-blue-500">인증되었습니다.</p>
          )}
        </div>

        {/* 비밀번호 입력 */}
        <div className="space-y-1 text-left">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            비밀번호<span className="ml-1 text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleInputChange}
            className={`w-full h-12 ${errors.password ? "border-red-500" : ""}`}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {/* 약관 동의 체크박스들 */}
        <div className="space-y-3">
          {/* 전체 동의 */}
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

          {/* 개별 약관들 */}
          {TERMS_CONFIG.map(renderTermsCheckbox)}
        </div>

        {/* 회원가입 버튼 */}
        <Button
          type="submit"
          disabled={!canSubmit() || isLoading}
          className={`w-full text-white ${
            canSubmit()
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {isLoading ? "가입 중..." : "회원가입"}
        </Button>

        {/* 구분선 */}
        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-xs text-gray-400">또는</span>
          <Separator className="flex-1" />
        </div>

        {/* 구글 로그인 */}
        <button
          onClick={() => googleLogin()}
          className="flex items-center justify-center gap-4 w-full h-11 rounded-lg bg-[#f5f5f5] hover:bg-[#e0e0e0] shadow text-[#3c4043] text-[16px] font-medium"
          type="button"
        >
          <img src="/google.svg" alt="Google Logo" className="w-6 h-6" />
          Google로 계속하기
        </button>

        {/* 약관 링크 */}
        <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
          <button
            type="button"
            onClick={() => openNotionPage(NOTION_URLS.PRIVACY_PROCESSING)}
            className="font-bold hover:underline"
          >
            개인정보처리방침
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={() => openNotionPage(NOTION_URLS.SERVICE_TERMS_FOOTER)}
            className="hover:underline"
          >
            서비스 이용 약관
          </button>
        </div>
      </form>

      {/* 이메일 인증 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="relative w-full max-w-md p-8 bg-white rounded-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute flex items-center justify-center w-10 h-10 text-gray-500 border-2 border-gray-300 rounded-full top-6 right-6 hover:text-gray-700 hover:border-gray-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pt-4 space-y-6 text-center">
              <h2 className="text-xl font-bold text-gray-900">
                인증 메일이 발송되었습니다.
              </h2>

              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">{form.email}</span> 으로 메일이
                  발송되었습니다.
                </p>
                <p className="text-gray-700">
                  메일함에서 "인증하기" 버튼을 눌러주세요.
                </p>
              </div>

              <Button
                onClick={handleEmailVerification}
                disabled={isRequestingVerification}
                className="w-full py-3 text-base font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl"
              >
                {isRequestingVerification ? "전송 중..." : "이메일 재전송"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SignupPage = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <SignupPageContent />
    </GoogleOAuthProvider>
  );
};

export default SignupPage;
