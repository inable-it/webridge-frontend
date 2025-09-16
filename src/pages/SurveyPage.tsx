import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useCreateUserExtraInfoMutation } from "@/features/api/extraInfoApi";
import CustomSelect from "@/components/common/Select";
import { PATH_OPTIONS, JOB_OPTIONS } from "@/constants/survey";
import type { Code } from "@/types/shared";

const isBlank = (v?: string) => !v || v.trim().length === 0;

const toMessage = (err: unknown) => {
  if (!err) return "";
  const anyErr = err as any;
  return (
    anyErr?.data?.message ??
    anyErr?.error ??
    anyErr?.message ??
    (typeof err === "string" ? err : JSON.stringify(err))
  );
};

const SurveyPage = () => {
  const navigate = useNavigate();
  const [createExtraInfo, { isLoading }] = useCreateUserExtraInfoMutation();

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

  // 레이블-입력 연결용 id
  const pathOtherId = useId();
  const jobOtherId = useId();
  const pathOtherErrId = `${pathOtherId}-err`;
  const jobOtherErrId = `${jobOtherId}-err`;

  // 유효성 검사
  // - path === 'f' 인 경우: pathOther 필수
  // - path !== 'f' 인 경우: path 또는 pathOther 둘 중 하나는 필수
  // - job도 동일 규칙
  const validate = () => {
    const next: typeof errors = {};

    // PATH
    if (path === "f") {
      if (isBlank(pathOther)) next.pathOther = "기타 경로를 입력해 주세요.";
    } else {
      if (isBlank(path) && isBlank(pathOther))
        next.path = "경로를 선택해 주세요.";
    }

    // JOB
    if (job === "f") {
      if (isBlank(jobOther)) next.jobOther = "기타 직군을 입력해 주세요.";
    } else {
      if (isBlank(job) && isBlank(jobOther)) next.job = "직군을 선택해 주세요.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // other 값이 존재하면 f 코드로 전송
    const finalPath: Code = pathOther.trim() ? "f" : (path as Code);
    const finalJob: Code = jobOther.trim() ? "f" : (job as Code);

    try {
      await createExtraInfo({
        path_to_webridge: finalPath, // a~f (기타 입력 시 f)
        path_to_webridge_other:
          finalPath === "f" ? pathOther.trim() : undefined,
        occupation: finalJob, // a~f (기타 입력 시 f)
        occupation_other: finalJob === "f" ? jobOther.trim() : undefined,
      }).unwrap();

      navigate("/dashboard");
    } catch (err) {
      alert(toMessage(err) || "제출 중 오류가 발생했습니다.");
    }
  };

  // 옵션: 현재 입력으로 제출 가능 여부 (UX 향상용)
  const canSubmit =
    !isLoading &&
    // PATH 가능 조건
    (path === "f"
      ? !isBlank(pathOther)
      : !isBlank(path) || !isBlank(pathOther)) &&
    // JOB 가능 조건
    (job === "f" ? !isBlank(jobOther) : !isBlank(job) || !isBlank(jobOther));

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

          {/* 셀렉트 (내부 기타 입력 비활성화) */}
          <CustomSelect
            value={path}
            onChange={(code) => {
              setPath(code as Code);
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
            // 페이지에서 직접 기타 입력을 제공할 것이므로 끔
            alwaysShowOtherInput={false as any}
          />

          {/* 기타 입력 (레이블 연결) */}
          <div className="space-y-1">
            <label
              htmlFor={pathOtherId}
              className="text-sm font-medium text-gray-700"
            >
              기타 경로 직접 입력
            </label>
            <Input
              id={pathOtherId}
              value={pathOther}
              onChange={(e) => {
                setPathOther(e.target.value);
                setErrors((p) => ({
                  ...p,
                  path: undefined,
                  pathOther: undefined,
                }));
              }}
              placeholder="예: 지인 추천, 컨퍼런스 등"
              aria-invalid={!!errors.pathOther}
              aria-describedby={errors.pathOther ? pathOtherErrId : undefined}
            />
            {errors.pathOther && (
              <p id={pathOtherErrId} className="text-sm text-red-500">
                {errors.pathOther}
              </p>
            )}
          </div>
        </div>

        {/* 직군 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            당신의 직군은 무엇인가요? <span className="text-red-500">*</span>
          </label>

          {/* 셀렉트 (내부 기타 입력 비활성화) */}
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
            // 페이지에서 직접 기타 입력을 제공할 것이므로 끔
            alwaysShowOtherInput={false as any}
          />

          {/* 기타 입력 (레이블 연결) */}
          <div className="space-y-1">
            <label
              htmlFor={jobOtherId}
              className="text-sm font-medium text-gray-700"
            >
              기타 직군 직접 입력
            </label>
            <Input
              id={jobOtherId}
              value={jobOther}
              onChange={(e) => {
                setJobOther(e.target.value);
                setErrors((p) => ({
                  ...p,
                  job: undefined,
                  jobOther: undefined,
                }));
              }}
              placeholder="예: 연구원, PMM, QA 등"
              aria-invalid={!!errors.jobOther}
              aria-describedby={errors.jobOther ? jobOtherErrId : undefined}
            />
            {errors.jobOther && (
              <p id={jobOtherErrId} className="text-sm text-red-500">
                {errors.jobOther}
              </p>
            )}
          </div>
        </div>

        {/* 제출 */}
        <Button
          type="submit"
          disabled={!canSubmit}
          className={`w-full h-12 text-base font-semibold text-white rounded-lg
           ${canSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-[#727272] cursor-not-allowed"}
          `}
        >
          {isLoading ? "제출 중..." : "제출하기"}
        </Button>
      </form>
    </div>
  );
};

export default SurveyPage;
