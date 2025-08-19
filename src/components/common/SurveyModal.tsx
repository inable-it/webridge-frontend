import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import {
  Q1_COMPANY_TYPES,
  Q2_USAGE_REASONS,
  Q4_PURCHASE_WAY,
  Q5_PRICE_MODEL,
  Q6_USE_METHOD,
  Q7_EXTRA_AI,
} from "@/constants/surveyModal";
import { useCreateSurveyMutation } from "@/features/api/surveyApi";

type Props = {
  open: boolean;
  onClose: () => void;
};

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

export default function SurveyModal({ open, onClose }: Props) {
  const [createSurvey, { isLoading, isSuccess }] = useCreateSurveyMutation();

  // 단계 0~(마지막)
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

  const [satOverall, setSatOverall] = useState<number | null>(null);
  const [satAccuracy, setSatAccuracy] = useState<number | null>(null);
  const [satReuse, setSatReuse] = useState<number | null>(null);
  const [satRecommend, setSatRecommend] = useState<number | null>(null);

  const [purchaseWay, setPurchaseWay] = useState<string>("");
  const [purchaseWayOther, setPurchaseWayOther] = useState("");

  const [priceModel, setPriceModel] = useState<string>("");
  const [priceModelOther, setPriceModelOther] = useState("");

  const [useMethods, setUseMethods] = useState<string[]>([]);
  const [useMethodOther, setUseMethodOther] = useState("");

  const [futureFeatures, setFutureFeatures] = useState<string[]>([]);
  const [futureFeatureOther, setFutureFeatureOther] = useState("");

  const [opinion, setOpinion] = useState("");

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

  if (!open) return null;

  const toggleMulti = (
    list: string[],
    setList: (v: string[]) => void,
    code: string
  ) => {
    setList(
      list.includes(code) ? list.filter((c) => c !== code) : [...list, code]
    );
  };

  const nextDisabled = useMemo(() => {
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
        return !satOverall || !satAccuracy || !satReuse || !satRecommend;
      case 6:
        return !purchaseWay && !purchaseWayOther.trim();
      case 7:
        return !priceModel && !priceModelOther.trim();
      case 8:
        return useMethods.length === 0 && !useMethodOther.trim();
      case 9:
        return futureFeatures.length === 0 && !futureFeatureOther.trim();
      // 10 자유응답은 선택사항
      default:
        return false;
    }
  }, [
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

  const goNext = async () => {
    // 제출
    if (step === LAST_STEP - 1) {
      const payload = {
        email,
        privacy_agreed: privacyAgreed,

        company_type: [
          ...companyTypes,
          ...(companyTypeOther.trim() ? ["j"] : []),
        ].join(","),
        company_type_other: companyTypeOther.trim() || undefined,

        usage_reason: [
          ...usageReasons,
          ...(usageReasonOther.trim() ? ["h"] : []),
        ].join(","),

        satisfaction_overall: satOverall!,
        satisfaction_accuracy: satAccuracy!,
        satisfaction_reuse: satReuse!,
        satisfaction_recommend: satRecommend!,

        // Q4(구매 방식) → 스키마상 'user_type'가 있어 선택적으로 사용 가능
        user_type: purchaseWay || (purchaseWayOther.trim() ? "d" : undefined),
        user_type_other: purchaseWayOther.trim() || undefined,

        // Q5(이용료 모델) → purchase_method
        purchase_method: priceModel || (priceModelOther.trim() ? "d" : ""),
        purchase_method_other: priceModelOther.trim() || undefined,

        // Q6(이용 방식) → use_method
        use_method: [
          ...useMethods,
          ...(useMethodOther.trim() ? ["f"] : []),
        ].join(","),
        use_method_other: useMethodOther.trim() || undefined,

        // Q7(추가기능) → future_feature
        future_feature: [
          ...futureFeatures,
          ...(futureFeatureOther.trim() ? ["f"] : []),
        ].join(","),
        future_feature_other: futureFeatureOther.trim() || undefined,

        // Q8
        improvement_opinion: opinion.trim() || undefined,
      } as const;

      try {
        await createSurvey(payload).unwrap();
        setStep(LAST_STEP); // 완료 화면
      } catch (e: any) {
        alert(e?.data?.message || "설문 제출 중 오류가 발생했습니다.");
      }
      return;
    }
    setStep((s) => Math.min(LAST_STEP, s + 1));
  };

  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  return (
    <Card onClose={onClose}>
      {/* 진행 점선 (2~9단계에서만) */}
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

      {/* 1. 이메일 */}
      {step === 1 && (
        <div>
          <h3 className="mb-4 text-[18px] font-semibold text-center">
            당첨 안내를 받으실 이메일 주소를 입력해 주세요.
          </h3>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="webridge@example.com"
            className="h-11"
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

      {/* 2. 개인정보 동의 */}
      {step === 2 && (
        <div>
          <h3 className="mb-3 text-[18px] font-semibold text-center">
            개인정보 수집/이용 동의서
          </h3>
          <div className="h-48 p-4 overflow-auto text-sm leading-6 text-gray-700 border rounded-lg bg-gray-50">
            <p className="mb-2 font-medium">개인정보 수집/이용 동의서</p>
            <ul className="pl-5 space-y-1 list-disc">
              <li>수집 항목: 이메일</li>
              <li>이용 목적: MVP 테스트 및 피드백 분석</li>
              <li>보유 기간: 응모자 선정까지</li>
              <li>
                동의하지 않으셔도 되며, 동의하지 않을 경우 추첨 안내 메일을 받을
                수 없습니다.
              </li>
            </ul>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={goPrev}>
              비동의
            </Button>
            <Button
              onClick={() => {
                setPrivacyAgreed(true);
                goNext();
              }}
              disabled={isLoading}
            >
              동의
            </Button>
          </div>
        </div>
      )}

      {/* 3. 회사 유형 (복수) */}
      {step === 3 && (
        <div>
          <p className="mb-3 text-[18px] font-semibold">
            1. 귀하가 속한 회사(기관)의 유형을 선택해 주세요. (복수 선택 가능)
          </p>
          <div className="p-2 bg-white border rounded-xl">
            {Q1_COMPANY_TYPES.map((o) => (
              <label
                key={o.code}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={companyTypes.includes(o.code)}
                  onChange={() =>
                    toggleMulti(companyTypes, setCompanyTypes, o.code)
                  }
                />
                <span className="text-sm">{o.label}</span>
              </label>
            ))}
            {/* 기타 입력 */}
            <div className="my-2 border-t" />
            <div className="px-3 pb-2">
              <Input
                placeholder="기타 응답을 작성해 주세요."
                value={companyTypeOther}
                onChange={(e) => setCompanyTypeOther(e.target.value)}
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

      {/* 4. 사용 이유 (복수) */}
      {step === 4 && (
        <div>
          <p className="mb-3 text-[18px] font-semibold">
            2. WEBridge를 사용한 주된 이유를 선택해 주세요. (복수 선택 가능)
          </p>
          <div className="p-2 bg-white border rounded-xl">
            {Q2_USAGE_REASONS.map((o) => (
              <label
                key={o.code}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={usageReasons.includes(o.code)}
                  onChange={() =>
                    toggleMulti(usageReasons, setUsageReasons, o.code)
                  }
                />
                <span className="text-sm">{o.label}</span>
              </label>
            ))}
            <div className="my-2 border-t" />
            <div className="px-3 pb-2">
              <Input
                placeholder="기타 응답을 작성해 주세요."
                value={usageReasonOther}
                onChange={(e) => setUsageReasonOther(e.target.value)}
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

      {/* 5. 만족도 (리커트 1~5) */}
      {step === 5 && (
        <div>
          <p className="mb-4 text-[18px] font-semibold">
            3. WEBridge 만족도를 평가해 주세요.
          </p>
          <div className="space-y-4">
            {[
              {
                key: "overall",
                label: "(1) 전반적으로 만족한다.",
                value: satOverall,
                setter: setSatOverall,
              },
              {
                key: "accuracy",
                label: "(2) 12가지 항목의 점검 결과가 전반적으로 정확했다.",
                value: satAccuracy,
                setter: setSatAccuracy,
              },
              {
                key: "reuse",
                label: "(3) 재사용할 의향이 있다.",
                value: satReuse,
                setter: setSatReuse,
              },
              {
                key: "recommend",
                label: "(4) 다른 사람이나 기관에 추천하고 싶다.",
                value: satRecommend,
                setter: setSatRecommend,
              },
            ].map((row) => (
              <div key={row.key} className="p-3 border rounded-lg">
                <div className="mb-2 text-sm">{row.label}</div>
                <div className="flex items-center justify-between">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label key={n} className="flex flex-col items-center gap-1">
                      <input
                        type="radio"
                        name={row.key}
                        checked={row.value === n}
                        onChange={() => row.setter(n)}
                      />
                      <span className="text-xs">{n}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
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
          <div className="p-2 bg-white border rounded-xl">
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
            <div className="my-2 border-t" />
            <div className="px-3 pb-2">
              <Input
                placeholder="기타 응답을 작성해 주세요."
                value={purchaseWayOther}
                onChange={(e) => {
                  setPurchaseWay("");
                  setPurchaseWayOther(e.target.value);
                }}
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
          <div className="p-2 bg-white border rounded-xl">
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
            <div className="my-2 border-t" />
            <div className="px-3 pb-2">
              <Input
                placeholder="기타 응답을 작성해 주세요."
                value={priceModelOther}
                onChange={(e) => {
                  setPriceModel("");
                  setPriceModelOther(e.target.value);
                }}
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
          <div className="p-2 bg-white border rounded-xl">
            {Q6_USE_METHOD.map((o) => (
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
            <div className="my-2 border-t" />
            <div className="px-3 pb-2">
              <Input
                placeholder="기타 응답을 작성해 주세요."
                value={useMethodOther}
                onChange={(e) => setUseMethodOther(e.target.value)}
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
          <div className="p-2 bg-white border rounded-xl">
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
            <div className="my-2 border-t" />
            <div className="px-3 pb-2">
              <Input
                placeholder="기타 응답을 작성해 주세요."
                value={futureFeatureOther}
                onChange={(e) => setFutureFeatureOther(e.target.value)}
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
            className="w-full p-3 border rounded-lg outline-none h-36 focus:ring-2 focus:ring-blue-500"
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
          <Button className="w-full mt-6" onClick={onClose}>
            닫기
          </Button>
        </div>
      )}
    </Card>
  );
}
