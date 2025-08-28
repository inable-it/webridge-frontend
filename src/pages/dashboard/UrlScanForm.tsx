import { useState, useMemo } from "react";
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

  // 첫 번째 URL만 뽑아오는 정규식 (텍스트에 여러 URL이 섞여 붙여넣기된 경우)
  const firstUrlInText = (text: string) => {
    const urlRegex =
      /(https?:\/\/[^\s<>"'`]+)|(^www\.[^\s<>"'`]+)|(^[^\s]+\.[^\s]+\/[^\s]*)/i;
    const match = text.match(urlRegex);
    return match ? match[0] : text;
  };

  const hasMultipleTokens = useMemo(() => {
    // 공백/줄바꿈/쉼표/세미콜론 등으로 분리했을 때 2개 이상이면 "여러 개"로 판단
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

  // 로그인 필요 페이지의 흔한 패턴 힌트(강제 차단 X, 명시적 경로면 차단)
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

    // 1) 필수
    if (!value) return "URL은 필수 입력 항목입니다.";

    // 2) 하나의 URL만 입력
    if (hasMultipleTokens) return "하나의 URL만 입력해주세요.";

    // 3) 프로토콜 포함 & 유효성
    if (!/^https?:\/\//i.test(value)) {
      return "유효한 URL을 입력해주세요. (예: https://example.com)";
    }
    if (!isValidUrl(value)) {
      return "URL 형식이 올바르지 않습니다.";
    }

    // 4) 로그인 필요로 추정되는 경로 차단(명시적 /login, /signin)
    if (looksLikeLoginPath(value)) {
      return "로그인이 필요한 페이지는 검사할 수 없습니다. 공개 페이지의 URL을 입력해주세요.";
    }

    // 5) 크롤링 차단 사이트 안내(사전 감지는 불가 → 안내만)
    //   실제 차단은 서버에서 판단하므로 여기선 안내만 합니다.
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
        {/* 주소 입력 + 시작 버튼 (한 줄) */}
        <div className="flex items-center gap-2">
          <Input
            type="url"
            inputMode="url"
            autoComplete="url"
            aria-invalid={!!error}
            aria-describedby="url-rules url-error"
            placeholder="https://example.com"
            className={`flex-1 ${
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
            className="shrink-0"
          >
            {isCreating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* 규칙 안내 */}
        <div id="url-rules" className="space-y-1 text-xs text-gray-700">
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

        {/* 에러 메시지 */}
        {error && (
          <p id="url-error" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
