import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Option } from "@/types/shared";
import { Input } from "@/components/ui/input";

type Props = {
  value: string; // "a" ~ "f" 또는 ""
  onChange: (code: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;

  // 기타 입력
  otherCode?: string; // 기본 "f"
  otherValue?: string;
  onChangeOther?: (v: string) => void;
  otherPlaceholder?: string;

  // 드롭다운 하단에 항상 기타 입력 영역 보여줄지
  alwaysShowOtherInput?: boolean;
};

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "선택해 주세요.",
  error,
  otherCode = "f",
  otherValue = "",
  onChangeOther,
  otherPlaceholder = "기타 응답을 작성해 주세요.",
  alwaysShowOtherInput = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("click", onClickOutside);
    return () => window.removeEventListener("click", onClickOutside);
  }, []);

  const handlePick = (code: string) => {
    onChange(code);
    if (code !== otherCode && otherValue) {
      // 다른 값 선택하면 기타 입력 초기화
      onChangeOther?.("");
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full h-12 px-3 pr-10 text-left rounded-md border bg-white text-sm
          ${error ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"}
        `}
      >
        {selected ? (
          selected.label
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <ChevronDown className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 right-3 top-1/2" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 w-full mt-2 overflow-hidden bg-white border shadow-lg rounded-xl">
          <ul className="py-2 overflow-auto max-h-64">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => handlePick(opt.value)}
                  className={`w-full px-4 py-3 text-sm text-left hover:bg-gray-50
                    ${opt.value === value ? "bg-blue-50 text-blue-600" : ""}
                  `}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>

          {/* 하단 기타 입력 (항상 노출 옵션) */}
          {(alwaysShowOtherInput || value === otherCode) && (
            <>
              <div className="h-px bg-gray-200" />
              <div className="p-3">
                <Input
                  value={otherValue}
                  onFocus={() => {
                    if (value !== otherCode) onChange(otherCode); // 포커스만 해도 f로 설정
                  }}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (value !== otherCode) onChange(otherCode); // 타이핑하면 f 설정
                    onChangeOther?.(v);
                  }}
                  placeholder={otherPlaceholder}
                  className="h-11"
                />
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
