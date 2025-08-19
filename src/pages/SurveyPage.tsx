import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCreateUserExtraInfoMutation } from "@/features/api/extraInfoApi";
import CustomSelect from "@/components/common/Select";
import { PATH_OPTIONS, JOB_OPTIONS } from "@/constants/survey";
import type { Code } from "@/types/shared";

const SurveyPage = () => {
  const navigate = useNavigate();
  const [createExtraInfo, { isLoading }] = useCreateUserExtraInfoMutation();

  // 코드값 보관 ("", "a"~"f")
  const [path, setPath] = useState<Code | "">("");
  const [pathOther, setPathOther] = useState("");
  const [job, setJob] = useState<Code | "">("");
  const [jobOther, setJobOther] = useState("");

  const [errors, setErrors] = useState<{
    path?: string;
    job?: string;
    pathOther?: string;
    jobOther?: string;
  }>({});

  const isPathOther = path === "f"; // 기타
  const isJobOther = job === "f";

  const validate = () => {
    const next: typeof errors = {};
    if (!path) next.path = "경로를 선택해 주세요.";
    if (!job) next.job = "직군을 선택해 주세요.";
    if (isPathOther && !pathOther.trim())
      next.pathOther = "기타 경로를 입력해 주세요.";
    if (isJobOther && !jobOther.trim())
      next.jobOther = "기타 직군을 입력해 주세요.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createExtraInfo({
        path_to_webridge: path!, // "a"~"f"
        path_to_webridge_other: isPathOther ? pathOther.trim() : undefined,
        occupation: job!, // "a"~"f"
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
          <CustomSelect
            value={path}
            onChange={(code) => {
              setPath(code as Code);
              // 코드가 변경될 때 기타가 아니라면 입력 초기화
              if (code !== "f") setPathOther("");
              setErrors((p) => ({
                ...p,
                path: undefined,
                pathOther: undefined,
              }));
            }}
            options={PATH_OPTIONS}
            placeholder="경로를 선택해 주세요."
            error={errors.path}
            showOtherInput={isPathOther}
            otherValue={pathOther}
            onChangeOther={(v) => {
              setPathOther(v);
              if (v) setErrors((p) => ({ ...p, pathOther: undefined }));
            }}
            otherPlaceholder="기타 응답을 작성해 주세요."
          />
          {errors.pathOther && (
            <p className="text-sm text-red-500">{errors.pathOther}</p>
          )}
        </div>

        {/* 직군 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            당신의 직군은 무엇인가요? <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={job}
            onChange={(code) => {
              setJob(code as Code);
              if (code !== "f") setJobOther("");
              setErrors((p) => ({ ...p, job: undefined, jobOther: undefined }));
            }}
            options={JOB_OPTIONS}
            placeholder="직군을 선택해 주세요."
            error={errors.job}
            showOtherInput={isJobOther}
            otherValue={jobOther}
            onChangeOther={(v) => {
              setJobOther(v);
              if (v) setErrors((p) => ({ ...p, jobOther: undefined }));
            }}
            otherPlaceholder="기타 응답을 작성해 주세요."
          />
          {errors.jobOther && (
            <p className="text-sm text-red-500">{errors.jobOther}</p>
          )}
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
