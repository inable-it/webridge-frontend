import { useEffect, useMemo, useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import {
  Q1_COMPANY_TYPES,
  Q2_USAGE_REASONS,
  Q4_PURCHASE_WAY,
  Q5_PRICE_MODEL,
  Q6_USAGE_METHOD,
  Q7_EXTRA_AI,
} from "@/constants/surveyModal";
import { useCreateSurveyMutation } from "@/features/api/surveyApi";

type Props = {
  open: boolean;
  onClose: () => void;
  /** 마지막 '완료' 버튼 클릭 시 호출되어 즉시 서버 상태를 새로고침하도록 부모에서 넘겨주세요. */
  onCompleted?: () => void;
};

// 1~5 리커트 타입
type Likert = 1 | 2 | 3 | 4 | 5;
const LIKERT: readonly Likert[] = [1, 2, 3, 4, 5] as const;

const StepDots = ({ total, index }: { total: number; index: number }) => (
  <div className="flex items-center justify-center gap-1 mb-4" aria-hidden>
    {Array.from({ length: total }).map((_, i) => (
      <span
        key={i}
        className={`h-1.5 rounded-full transition-all ${
          i <= index ? "bg-gray-700 w-6" : "bg-gray-300 w-3"
        }`}
      />
    ))}
  </div>
);

const Card: React.FC<{
  title?: string;
  onClose?: () => void;
  children: any;
}> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center">
    <div className="absolute inset-0 bg-black/40" role="presentation" />
    <div
      role="dialog"
      aria-modal="true"
      className="relative w-[460px] max-w-[90vw] bg-white rounded-2xl shadow-xl p-6"
    >
      {onClose && (
        <button
          aria-label="닫기"
          onClick={onClose}
          className="absolute p-1 text-gray-500 rounded-full right-3 top-3 hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      {title && (
        <h2 className="mb-3 text-lg font-semibold text-center">{title}</h2>
      )}
      {children}
    </div>
  </div>
);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SurveyModal({ open, onClose, onCompleted }: Props) {
  const [createSurvey, { isLoading }] = useCreateSurveyMutation();

  // 0 안내 → 1 이메일 → 2 동의 → 3~10(문항1~8) → 11 완료
  const LAST_STEP = 11;
  const [step, setStep] = useState(0);

  // 응답 상태
  const [email, setEmail] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const [companyTypes, setCompanyTypes] = useState<string[]>([]);
  const [companyTypeOther, setCompanyTypeOther] = useState("");

  const [usageReasons, setUsageReasons] = useState<string[]>([]);
  const [usageReasonOther, setUsageReasonOther] = useState("");

  // Likert 타입
  const [satOverall, setSatOverall] = useState<Likert | null>(null);
  const [satAccuracy, setSatAccuracy] = useState<Likert | null>(null);
  const [satReuse, setSatReuse] = useState<Likert | null>(null);
  const [satRecommend, setSatRecommend] = useState<Likert | null>(null);

  const [purchaseWay, setPurchaseWay] = useState<string>("");
  const [purchaseWayOther, setPurchaseWayOther] = useState("");

  const [priceModel, setPriceModel] = useState<string>("");
  const [priceModelOther, setPriceModelOther] = useState("");

  const [useMethods, setUseMethods] = useState<string[]>([]);
  const [useMethodOther, setUseMethodOther] = useState("");

  const [futureFeatures, setFutureFeatures] = useState<string[]>([]);
  const [futureFeatureOther, setFutureFeatureOther] = useState("");

  const [opinion, setOpinion] = useState("");

  // ---------- 고유 id들 (레이블 연결용) ----------
  const emailId = useId();

  const privacyId = useId();

  const q1Prefix = useId();
  const q1OtherId = useId();

  const q2Prefix = useId();
  const q2OtherId = useId();

  const q3overallPrefix = useId();
  const q3accuracyPrefix = useId();
  const q3reusePrefix = useId();
  const q3recommendPrefix = useId();

  // 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setStep(0);
      setEmail("");
      setPrivacyAgreed(false);
      setCompanyTypes([]);
      setCompanyTypeOther("");
      setUsageReasons([]);
      setUsageReasonOther("");
      setSatOverall(null);
      setSatAccuracy(null);
      setSatReuse(null);
      setSatRecommend(null);
      setPurchaseWay("");
      setPurchaseWayOther("");
      setPriceModel("");
      setPriceModelOther("");
      setUseMethods([]);
      setUseMethodOther("");
      setFutureFeatures([]);
      setFutureFeatureOther("");
      setOpinion("");
    }
  }, [open]);

  const nextDisabled = useMemo(() => {
    if (!open) return true;
    switch (step) {
      case 0:
        return false;
      case 1:
        return !emailRegex.test(email);
      case 2:
        return !privacyAgreed;
      case 3:
        return companyTypes.length === 0 && !companyTypeOther.trim();
      case 4:
        return usageReasons.length === 0 && !usageReasonOther.trim();
      case 5:
        return (
          satOverall === null ||
          satAccuracy === null ||
          satReuse === null ||
          satRecommend === null
        );
      case 6:
        return !purchaseWay && !purchaseWayOther.trim();
      case 7:
        return !priceModel && !priceModelOther.trim();
      case 8:
        return useMethods.length === 0 && !useMethodOther.trim();
      case 9:
        return futureFeatures.length === 0 && !futureFeatureOther.trim();
      default:
        return false;
    }
  }, [
    open,
    step,
    email,
    privacyAgreed,
    companyTypes,
    companyTypeOther,
    usageReasons,
    usageReasonOther,
    satOverall,
    satAccuracy,
    satReuse,
    satRecommend,
    purchaseWay,
    purchaseWayOther,
    priceModel,
    priceModelOther,
    useMethods,
    useMethodOther,
    futureFeatures,
    futureFeatureOther,
  ]);

  const toggleMulti = (
    list: string[],
    setList: (v: string[]) => void,
    code: string
  ) => {
    setList(
      list.includes(code) ? list.filter((c) => c !== code) : [...list, code]
    );
  };

  const goNext = async () => {
    if (step === LAST_STEP - 1) {
      // 최종 제출(10단계) → 서버 전송만, 닫기는 11단계 버튼에서만
      const userTypeValue: string | undefined =
        purchaseWay || (purchaseWayOther.trim() ? "other" : undefined);

      const purchaseMethodValue: string =
        priceModel || (priceModelOther.trim() ? "other" : "other");

      const payload = {
        email,
        privacy_agreed: privacyAgreed,

        company_type: companyTypes,
        company_type_other: companyTypeOther.trim() || undefined,

        usage_reason: usageReasons,
        usage_reason_other: usageReasonOther.trim() || undefined,

        satisfaction_overall: satOverall!, // Likert
        satisfaction_accuracy: satAccuracy!,
        satisfaction_reuse: satReuse!,
        satisfaction_recommend: satRecommend!,

        user_type: userTypeValue,
        user_type_other: purchaseWayOther.trim() || undefined,

        purchase_method: purchaseMethodValue,
        purchase_method_other: priceModelOther.trim() || undefined,

        usage_method: useMethods,
        usage_method_other: useMethodOther.trim() || undefined,

        future_feature: futureFeatures,
        future_feature_other: futureFeatureOther.trim() || undefined,

        improvement_opinion: opinion.trim() || undefined,
      };

      try {
        await createSurvey(payload).unwrap();
        setStep(LAST_STEP); // 감사 화면으로 이동
      } catch (e: any) {
        const data = e?.data;
        const firstField = data && Object.keys(data)[0];
        const firstMsg =
          firstField && Array.isArray(data[firstField])
            ? data[firstField][0]
            : null;
        alert(firstMsg || data?.message || "설문 제출 중 오류가 발생했습니다.");
      }
      return;
    }
    setStep((s) => Math.min(LAST_STEP, s + 1));
  };
  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  if (!open) return null;

  return (
    // 완료 단계에서만 onClose 전달 → X 버튼 표시
    <Card onClose={step === 11 ? onClose : undefined}>
      {step >= 3 && step <= 10 && <StepDots total={8} index={step - 3} />}

      {/* 0. 인트로 */}
      {step === 0 && (
        <div className="text-center">
          <h3 className="text-[18px] font-semibold">
            WEBridge 만족도 설문 (3분 소요)
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            참여하신 분 중 추첨을 통해 30분께 커피 기프티콘을 드립니다. ☕️
          </p>
          <Button className="w-full mt-6" onClick={goNext}>
            참여하기
          </Button>
        </div>
      )}

      {/* 1. 이메일 (입력 + 레이블 연결) */}
      {step === 1 && (
        <div>
          <h3 className="mb-4 text-[18px] font-semibold text-center">
            당첨 안내를 받으실 이메일 주소를 입력해 주세요.
          </h3>

          <label htmlFor={emailId} className="block mb-2 text-sm font-medium">
            이메일 주소
          </label>
          <Input
            id={emailId}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="webridge@example.com"
            inputMode="email"
            className="h-11 border border-[#727272]"
          />

          <div className="flex justify-between mt-6">
            <Button variant="secondary" disabled>
              이전
            </Button>
            <Button onClick={goNext} disabled={nextDisabled}>
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 2. 개인정보 동의 (체크박스 + 레이블 연결) */}
      {step === 2 && (
        <div>
          <h3 className="mb-3 text-[18px] font-semibold text-center">
            개인정보 수집/이용 동의서
          </h3>
          <div
            className="h-48 p-4 overflow-auto text-sm leading-6 text-gray-700 border rounded-lg bg-gray-50"
            aria-labelledby={privacyId + "-legend"}
          >
            <p id={privacyId + "-legend"} className="mb-2 font-medium">
              개인정보 수집/이용 동의서 본문
            </p>
            <p className="mb-2">
              아래와 같이 귀하의 개인정보를 수집 및 이용 내용을 개인정보보호법
              제15조(개인정보의 수집 및 이용) 및 통계법 33조(비밀의 보호 등)에
              의거하여 안내 드립니다.
            </p>
            <ul className="pl-5 space-y-1 list-disc">
              <li>
                개인정보의 수집 및 이용 목적 : MVP 테스트 및 피드백을 받기 위함
              </li>
              <li>수집하려는 개인정보의 필수 항목 : 이메일</li>
              <li>개인정보의 보유 및 이용 기간 : 필요시까지</li>
              <li>
                개인정보보호법에 의거하여 개인정보 수집 및 이용에 따른 동의를
                거부할 수 있으나, 동의를 거부할 경우 서비스 정식 출시 알람을
                받을 수 없습니다.
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input
              id={privacyId}
              type="checkbox"
              checked={privacyAgreed}
              onChange={(e) => setPrivacyAgreed(e.target.checked)}
              className="w-4 h-4"
            />
            <label
              htmlFor={privacyId}
              className="text-sm text-gray-900 cursor-pointer"
            >
              위 내용에 동의합니다.
            </label>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={goPrev}>
              이전
            </Button>
            <Button onClick={goNext} disabled={nextDisabled}>
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 3. 회사 유형 (복수) - 체크박스 & 기타 입력 레이블 */}
      {step === 3 && (
        <div>
          <p className="mb-3 text-[18px] font-semibold">
            1. 귀하가 속한 회사(기관)의 유형을 선택해 주세요. (복수 선택 가능)
          </p>
          <div className="p-2 bg-white rounded-xl border border-[#727272]">
            {Q1_COMPANY_TYPES.map((o) => {
              const id = `${q1Prefix}-${o.code}`;
              return (
                <div
                  key={o.code}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <input
                    id={id}
                    type="checkbox"
                    checked={companyTypes.includes(o.code)}
                    onChange={() =>
                      toggleMulti(companyTypes, setCompanyTypes, o.code)
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor={id} className="text-sm cursor-pointer">
                    {o.label}
                  </label>
                </div>
              );
            })}
            <div className="my-2 border-t border-[#727272]" />
            <div className="px-3 pb-2">
              <label
                htmlFor={q1OtherId}
                className="block mb-1 text-sm font-medium"
              >
                기타 응답
              </label>
              <Input
                id={q1OtherId}
                placeholder="기타 응답을 작성해 주세요."
                value={companyTypeOther}
                onChange={(e) => setCompanyTypeOther(e.target.value)}
                className="border border-[#727272]"
              />
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={goPrev}>
              이전
            </Button>
            <Button onClick={goNext} disabled={nextDisabled}>
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 4. 사용 이유 (복수) - 체크박스 & 기타 입력 레이블 */}
      {step === 4 && (
        <div>
          <p className="mb-3 text-[18px] font-semibold">
            2. WEBridge를 사용한 주된 이유를 선택해 주세요. (복수 선택 가능)
          </p>
          <div className="p-2 bg-white rounded-xl border border-[#727272]">
            {Q2_USAGE_REASONS.map((o) => {
              const id = `${q2Prefix}-${o.code}`;
              return (
                <div
                  key={o.code}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <input
                    id={id}
                    type="checkbox"
                    checked={usageReasons.includes(o.code)}
                    onChange={() =>
                      toggleMulti(usageReasons, setUsageReasons, o.code)
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor={id} className="text-sm cursor-pointer">
                    {o.label}
                  </label>
                </div>
              );
            })}
            <div className="my-2 border-t border-[#727272]" />
            <div className="px-3 pb-2">
              <label
                htmlFor={q2OtherId}
                className="block mb-1 text-sm font-medium"
              >
                기타 응답
              </label>
              <Input
                id={q2OtherId}
                placeholder="기타 응답을 작성해 주세요."
                value={usageReasonOther}
                onChange={(e) => setUsageReasonOther(e.target.value)}
                className="border border-[#727272]"
              />
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={goPrev}>
              이전
            </Button>
            <Button onClick={goNext} disabled={nextDisabled}>
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 5. 만족도 (리커트 1~5) - fieldset/legend + 라디오 레이블 */}
      {step === 5 && (
        <div>
          <p className="mb-4 text-[18px] font-semibold">
            3. WEBridge 만족도를 평가해 주세요.
          </p>

          <div className="space-y-4">
            {/* (1) 전반적 편의 */}
            <fieldset className="p-3 border rounded-lg border-[#727272]">
              <legend className="mb-2 text-sm">
                (1) WEBridge를 사용함에 있어 전반적으로 편리했다.
              </legend>
              <div className="flex items-center justify-between">
                {LIKERT.map((n) => {
                  const id = `${q3overallPrefix}-${n}`;
                  return (
                    <div key={id} className="flex flex-col items-center gap-1">
                      <input
                        id={id}
                        type="radio"
                        name="sat-overall"
                        checked={satOverall === n}
                        onChange={() => setSatOverall(n)}
                        className="w-4 h-4"
                      />
                      <label htmlFor={id} className="text-xs cursor-pointer">
                        {n}
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>

            {/* (2) 정확도 */}
            <fieldset className="p-3 border rounded-lg border-[#727272]">
              <legend className="mb-2 text-sm">
                (2) WEBridge의 웹 접근성 12가지 항목의 진단 결과가 전반적으로
                정확했다.
              </legend>
              <div className="flex items-center justify-between">
                {LIKERT.map((n) => {
                  const id = `${q3accuracyPrefix}-${n}`;
                  return (
                    <div key={id} className="flex flex-col items-center gap-1">
                      <input
                        id={id}
                        type="radio"
                        name="sat-accuracy"
                        checked={satAccuracy === n}
                        onChange={() => setSatAccuracy(n)}
                        className="w-4 h-4"
                      />
                      <label htmlFor={id} className="text-xs cursor-pointer">
                        {n}
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>

            {/* (3) 재사용 의향 */}
            <fieldset className="p-3 border rounded-lg border-[#727272]">
              <legend className="mb-2 text-sm">
                (3) WEBridge를 재사용할 의향이 있다.
              </legend>
              <div className="flex items-center justify-between">
                {LIKERT.map((n) => {
                  const id = `${q3reusePrefix}-${n}`;
                  return (
                    <div key={id} className="flex flex-col items-center gap-1">
                      <input
                        id={id}
                        type="radio"
                        name="sat-reuse"
                        checked={satReuse === n}
                        onChange={() => setSatReuse(n)}
                        className="w-4 h-4"
                      />
                      <label htmlFor={id} className="text-xs cursor-pointer">
                        {n}
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>

            {/* (4) 추천 의향 */}
            <fieldset className="p-3 border rounded-lg border-[#727272]">
              <legend className="mb-2 text-sm">
                (4) WEBridge를 다른 사람이나 기관에 추천하고 싶다.
              </legend>
              <div className="flex items-center justify-between">
                {LIKERT.map((n) => {
                  const id = `${q3recommendPrefix}-${n}`;
                  return (
                    <div key={id} className="flex flex-col items-center gap-1">
                      <input
                        id={id}
                        type="radio"
                        name="sat-recommend"
                        checked={satRecommend === n}
                        onChange={() => setSatRecommend(n)}
                        className="w-4 h-4"
                      />
                      <label htmlFor={id} className="text-xs cursor-pointer">
                        {n}
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={goPrev}>
              이전
            </Button>
            <Button onClick={goNext} disabled={nextDisabled}>
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 6. 구매 방식 (단일) */}
      {step === 6 && (
        <div>
          <p className="mb-3 text-[18px] font-semibold">
            4. WEBridge를 구매한다면, 어떤 방식으로 사용하고 싶으신가요? (단일
            선택)
          </p>
          <div className="p-2 bg-white rounded-xl border border-[#727272]">
            {Q4_PURCHASE_WAY.map((o) => (
              <label
                key={o.code}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="purchase-way"
                  checked={purchaseWay === o.code}
                  onChange={() => setPurchaseWay(o.code)}
                />
                <span className="text-sm">{o.label}</span>
              </label>
            ))}
            <div className="my-2 border-t border border-[#727272]" />
            <div className="px-3 pb-2">
              <Input
                placeholder="기타 응답을 작성해 주세요."
                value={purchaseWayOther}
                onChange={(e) => {
                  setPurchaseWay("");
                  setPurchaseWayOther(e.target.value);
                }}
                className="border border-[#727272]"
              />
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={goPrev}>
              이전
            </Button>
            <Button onClick={goNext} disabled={nextDisabled}>
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 7. 이용료 형태 (단일) */}
      {step === 7 && (
        <div>
          <p className="mb-3 text-[18px] font-semibold">
            5. WEBridge를 구매한다면, 어떤 이용료 형태를 선호하시나요? (단일
            선택)
          </p>
          <div className="p-2 bg-white rounded-xl border border-[#727272]">
            {Q5_PRICE_MODEL.map((o) => (
              <label
                key={o.code}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="price-model"
                  checked={priceModel === o.code}
                  onChange={() => setPriceModel(o.code)}
                />
                <span className="text-sm">{o.label}</span>
              </label>
            ))}
            <div className="my-2 border-t border border-[#727272]" />
            <div className="px-3 pb-2">
              <Input
                placeholder="기타 응답을 작성해 주세요."
                value={priceModelOther}
                onChange={(e) => {
                  setPriceModel("");
                  setPriceModelOther(e.target.value);
                }}
                className="border border-[#727272]"
              />
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={goPrev}>
              이전
            </Button>
            <Button onClick={goNext} disabled={nextDisabled}>
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 8. 이용 방식 (복수) */}
      {step === 8 && (
        <div>
          <p className="mb-3 text-[18px] font-semibold">
            6. 앞으로 WEBridge를 어떤 방식으로 이용하시길 원하나요? (복수 선택
            가능)
          </p>
          <div className="p-2 bg-white rounded-xl border border-[#727272]">
            {Q6_USAGE_METHOD.map((o) => (
              <label
                key={o.code}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={useMethods.includes(o.code)}
                  onChange={() =>
                    toggleMulti(useMethods, setUseMethods, o.code)
                  }
                />
                <span className="text-sm">{o.label}</span>
              </label>
            ))}
            <div className="my-2 border-t border border-[#727272]" />
            <div className="px-3 pb-2">
              <Input
                placeholder="기타 응답을 작성해 주세요."
                value={useMethodOther}
                onChange={(e) => setUseMethodOther(e.target.value)}
                className="border border-[#727272]"
              />
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={goPrev}>
              이전
            </Button>
            <Button onClick={goNext} disabled={nextDisabled}>
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 9. 추가 도입 희망 기능 (복수) */}
      {step === 9 && (
        <div>
          <p className="mb-3 text-[18px] font-semibold">
            7. WEBridge에 추가로 도입되기를 원하는 AI 기능은 무엇입니까? (복수
            선택 가능)
          </p>
          <div className="p-2 bg-white rounded-xl border border-[#727272]">
            {Q7_EXTRA_AI.map((o) => (
              <label
                key={o.code}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={futureFeatures.includes(o.code)}
                  onChange={() =>
                    toggleMulti(futureFeatures, setFutureFeatures, o.code)
                  }
                />
                <span className="text-sm">{o.label}</span>
              </label>
            ))}
            <div className="my-2 border-t border border-[#727272]" />
            <div className="px-3 pb-2">
              <Input
                placeholder="기타 응답을 작성해 주세요."
                value={futureFeatureOther}
                onChange={(e) => setFutureFeatureOther(e.target.value)}
                className="border border-[#727272]"
              />
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={goPrev}>
              이전
            </Button>
            <Button onClick={goNext} disabled={nextDisabled}>
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 10. 자유 의견 */}
      {step === 10 && (
        <div>
          <p className="mb-3 text-[18px] font-semibold">
            8. WEBridge에 대한 개선 의견이나 추가 기능 제안이 있다면 자유롭게
            작성해 주세요.
          </p>
          <textarea
            className="w-full p-3 border border-[#727272] rounded-lg outline-none h-36 focus:ring-2 focus:ring-blue-500"
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            placeholder="의견을 입력해 주세요."
          />
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={goPrev}>
              이전
            </Button>
            <Button onClick={goNext} disabled={isLoading}>
              완료
            </Button>
          </div>
        </div>
      )}

      {/* 11. 완료 */}
      {step === 11 && (
        <div className="text-center">
          <h3 className="text-[18px] font-semibold">
            🎉 WEBridge 만족도 설문 완료 🎉
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            소중한 의견 감사합니다. 당첨 여부는 추첨 후 이메일로 안내드립니다.
          </p>
          {/* 마지막 버튼에서만 refetch 호출 + 모달 닫기 */}
          <Button
            className="w-full mt-6"
            onClick={() => {
              onCompleted?.(); // 서버 상태 즉시 새로고침(부모에서 구현)
              onClose(); // 모달 닫기
            }}
          >
            완료
          </Button>
        </div>
      )}
    </Card>
  );
}
