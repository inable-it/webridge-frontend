import { useState, useMemo, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronRight, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const UrlScanForm = ({
  isCreating,
  onStartScan,
}: {
  isCreating: boolean;
  onStartScan: (url: string) => void;
}) => {
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 레이블-입력 연결용 id들 (고유 보장)
  const inputId = useId();
  const rulesId = `${inputId}-rules`;
  const errorId = `${inputId}-error`;

  const firstUrlInText = (text: string) => {
    const urlRegex =
      /(https?:\/\/[^\s<>"'`]+)|(^www\.[^\s<>"'`]+)|(^[^\s]+\.[^\s]+\/[^\s]*)/i;
    const match = text.match(urlRegex);
    return match ? match[0] : text;
  };

  const hasMultipleTokens = useMemo(() => {
    const tokens = urlInput
      .split(/[\s,\n;]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    return tokens.length > 1;
  }, [urlInput]);

  const isValidUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const looksLikeLoginPath = (url: string) => {
    try {
      const { pathname } = new URL(url);
      return /(login|signin|sign-in)/i.test(pathname);
    } catch {
      return false;
    }
  };

  const validate = (raw: string): string | null => {
    const value = raw.trim();
    if (!value) return "URL은 필수 입력 항목입니다.";
    if (hasMultipleTokens) return "하나의 URL만 입력해주세요.";
    if (!/^https?:\/\//i.test(value)) {
      return "유효한 URL을 입력해주세요. (예: https://example.com)";
    }
    if (!isValidUrl(value)) {
      return "URL 형식이 올바르지 않습니다.";
    }
    if (looksLikeLoginPath(value)) {
      return "로그인이 필요한 페이지는 검사할 수 없습니다. 공개 페이지의 URL을 입력해주세요.";
    }
    return null;
  };

  const handleStart = () => {
    const url = firstUrlInText(urlInput.trim());
    const err = validate(url);
    if (err) {
      setError(err);
      toast({ title: "입력 오류", description: err });
      return;
    }
    setError(null);
    onStartScan(url);
    setUrlInput("");
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">접근성 검사</h2>

      <div className="space-y-2">
        {/* 접근성 레이블 */}
        <label htmlFor={inputId} className="sr-only">
          검사할 웹페이지 주소
        </label>
        {/* 시각적으로 숨기고 싶다면 위 클래스 대신 sr-only 사용: className="sr-only" */}

        {/* 주소 입력 + 시작 버튼 */}
        <div className="flex items-center gap-2">
          <Input
            id={inputId} // label과 연결
            name="scan-url"
            type="url"
            inputMode="url"
            autoComplete="url"
            required // 필수 입력 의미 부여
            aria-invalid={!!error}
            aria-describedby={`${rulesId}${error ? ` ${errorId}` : ""}`}
            placeholder="https://example.com"
            className={`flex-1 border border-[#727272] ${
              // 공백 추가
              error ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            value={urlInput}
            onChange={(e) => {
              const v = e.target.value;
              setUrlInput(v);
              if (error) setError(null);
            }}
            onPaste={(e) => {
              const text = e.clipboardData.getData("text");
              const first = firstUrlInText(text);
              if (text.trim() !== first.trim()) {
                e.preventDefault();
                setUrlInput(first);
                setError(
                  "하나의 URL만 입력 가능합니다. 첫 번째 URL만 적용했어요."
                );
                toast({
                  title: "여러 URL 감지",
                  description: "첫 번째 URL만 적용했습니다.",
                });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleStart();
            }}
            disabled={isCreating}
            pattern="https?://.*"
          />

          <Button
            variant="outline"
            size="icon"
            onClick={handleStart}
            disabled={isCreating || !urlInput.trim()}
            aria-label="검사 시작"
            className="shrink-0 border border-[#727272]"
          >
            {isCreating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* 규칙 안내 */}
        <div id={rulesId} className="space-y-1 text-xs text-gray-700">
          <div className="flex items-start gap-1">
            <Info className="mt-[2px] h-3.5 w-3.5" />
            <span>
              하나의 URL만 입력 가능합니다. (여러 개 붙여넣기 시 첫 번째만 사용)
            </span>
          </div>
          <div className="flex items-start gap-1">
            <Info className="mt-[2px] h-3.5 w-3.5" />
            <span>
              유효한 주소여야 하며 <code>https://</code> 또는{" "}
              <code>http://</code>로 시작해야 합니다.
            </span>
          </div>
          <div className="flex items-start gap-1">
            <Info className="mt-[2px] h-3.5 w-3.5" />
            <span>
              로그인이 필요한 페이지(예: <code>/login</code>,{" "}
              <code>/signin</code>)는 검사할 수 없습니다.
            </span>
          </div>
          <div className="flex items-start gap-1">
            <Info className="mt-[2px] h-3.5 w-3.5" />
            <span>
              보안/정책(robots·anti-bot 등)으로 크롤링이 막힌 페이지는 검사할 수
              없습니다.
            </span>
          </div>
        </div>

        {/* 에러 메시지 (스크린리더 즉시 공지) */}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
