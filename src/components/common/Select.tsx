import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Option } from "@/types/shared";
import { Input } from "@/components/ui/input";

type Props = {
  value: string; // 코드값 "a"~"f" 또는 ""
  onChange: (code: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  showOtherInput?: boolean;
  otherValue?: string;
  onChangeOther?: (v: string) => void;
  otherPlaceholder?: string;
};

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "선택해 주세요.",
  error,
  showOtherInput,
  otherValue,
  onChangeOther,
  otherPlaceholder = "기타 응답을 작성해 주세요.",
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
        <div
          className="absolute z-20 w-full mt-2 overflow-hidden bg-white border shadow-lg rounded-xl"
          role="listbox"
        >
          <ul className="py-2 overflow-auto max-h-64">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-sm text-left hover:bg-gray-50
                    ${opt.value === value ? "bg-blue-50 text-blue-600" : ""}
                  `}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>

          {/* ‘기타’ 선택 시 하단 입력 (이미지처럼 구분선 아래 입력 영역) */}
          {showOtherInput && (
            <>
              <div className="h-px bg-gray-200" />
              <div className="p-3">
                <Input
                  value={otherValue ?? ""}
                  onChange={(e) => onChangeOther?.(e.target.value)}
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
