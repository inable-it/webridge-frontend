import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useCreateUserExtraInfoMutation } from "@/features/api/extraInfoApi";

const PATH_OPTIONS = [
  "SNS",
  "웹 포털 검색",
  "동료 / 지인 추천",
  "커뮤니티(슬랙/오픈채팅방)",
  "이메일 홍보",
  "기타",
] as const;

const JOB_OPTIONS = [
  "PM/PO",
  "기획",
  "디자인",
  "개발/엔지니어링",
  "웹 접근성 전문가 / 컨설턴트",
  "경영/의사결정권자",
  "기타",
] as const;

const SurveyPage = () => {
  const navigate = useNavigate();
  const [createExtraInfo, { isLoading }] = useCreateUserExtraInfoMutation();

  // 상태
  const [path, setPath] = useState<string>("");
  const [pathOther, setPathOther] = useState("");
  const [job, setJob] = useState<string>("");
  const [jobOther, setJobOther] = useState("");

  const [errors, setErrors] = useState<{
    path?: string;
    job?: string;
    other?: string;
  }>({});

  const isPathOther = path === "기타";
  const isJobOther = job === "기타";

  const validate = () => {
    const next: typeof errors = {};
    if (!path) next.path = "경로를 선택해 주세요.";
    if (!job) next.job = "직군을 선택해 주세요.";
    if (isPathOther && !pathOther.trim())
      next.other = "기타 경로를 입력해 주세요.";
    if (isJobOther && !jobOther.trim())
      next.other = "기타 직군을 입력해 주세요.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createExtraInfo({
        path_to_webridge: path,
        path_to_webridge_other: isPathOther ? pathOther.trim() : undefined,
        occupation: job,
        occupation_other: isJobOther ? jobOther.trim() : undefined,
      }).unwrap();

      navigate("/login");
    } catch (err: any) {
      alert(err?.data?.message || "제출 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-8">
        {/* 헤더 */}
        <div className="space-y-2 text-center">
          <h1 className="text-[28px] leading-tight font-bold text-gray-900">
            맞춤형 서비스 제공을
            <br />
            위해 응답해 주세요.
          </h1>
        </div>

        {/* 경로 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            WEBridge 솔루션을 알게 된 경로는 무엇인가요?{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className={`w-full h-12 appearance-none rounded-md border px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500
                ${
                  errors.path
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
            >
              <option value="" disabled>
                경로를 선택해 주세요.
              </option>
              {PATH_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {/* arrow */}
            <svg
              className="absolute -translate-y-1/2 pointer-events-none right-3 top-1/2"
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M6 8l4 4 4-4"
                stroke="#9CA3AF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {isPathOther && (
            <Input
              value={pathOther}
              onChange={(e) => setPathOther(e.target.value)}
              placeholder="기타 응답을 작성해 주세요."
              className={`h-12 ${
                errors.other ? "border-red-500 focus:border-red-500" : ""
              }`}
            />
          )}
          {errors.path && <p className="text-sm text-red-500">{errors.path}</p>}
        </div>

        {/* 직군 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            당신의 직군은 무엇인가요? <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={job}
              onChange={(e) => setJob(e.target.value)}
              className={`w-full h-12 appearance-none rounded-md border px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500
                ${
                  errors.job
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
            >
              <option value="" disabled>
                직군을 선택해 주세요.
              </option>
              {JOB_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <svg
              className="absolute -translate-y-1/2 pointer-events-none right-3 top-1/2"
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M6 8l4 4 4-4"
                stroke="#9CA3AF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {isJobOther && (
            <Input
              value={jobOther}
              onChange={(e) => setJobOther(e.target.value)}
              placeholder="기타 응답을 작성해 주세요."
              className={`h-12 ${
                errors.other ? "border-red-500 focus:border-red-500" : ""
              }`}
            />
          )}
          {errors.job && <p className="text-sm text-red-500">{errors.job}</p>}
        </div>

        {/* 제출 */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          {isLoading ? "제출 중..." : "제출하기"}
        </Button>
      </form>
    </div>
  );
};

export default SurveyPage;
