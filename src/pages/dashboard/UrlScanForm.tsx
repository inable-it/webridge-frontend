import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const UrlScanForm = ({
  isCreating,
  onStartScan,
}: {
  isCreating: boolean;
  onStartScan: (url: string) => void;
}) => {
  const [urlInput, setUrlInput] = useState("");

  const isValidUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleStart = () => {
    if (!urlInput.trim()) {
      toast({ title: "오류", description: "URL을 입력해주세요." });
      return;
    }
    if (!isValidUrl(urlInput)) {
      toast({
        title: "오류",
        description: "http:// 또는 https:// 로 시작하는 URL을 입력해주세요.",
      });
      return;
    }
    onStartScan(urlInput);
    setUrlInput("");
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">접근성 검사</h2>
      <div className="flex items-center gap-2">
        <Input
          placeholder="https://"
          className="flex-1"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleStart();
          }}
          disabled={isCreating}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={handleStart}
          disabled={isCreating || !urlInput.trim()}
        >
          {isCreating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
};
