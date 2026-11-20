import { useMemo, useState } from "react";
import { Plus, Eye, Pencil, Loader2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetAdminTermsQuery,
  useGetAdminTermDetailQuery,
  useCreateAdminTermMutation,
  useUpdateAdminTermMutation,
  type AdminTermItem,
  type AdminTermPayload,
} from "@/features/api/adminApi";
import { toast } from "@/hooks/use-toast";

const TERM_TYPE_LABELS: Record<string, string> = {
  service: "서비스 이용약관",
  privacy: "개인정보 처리방침",
  marketing: "마케팅 수신 동의",
  age: "만 14세 이상 확인",
};

const EMPTY_FORM: AdminTermPayload = {
  type: "service",
  version: "1.0",
  change_type: "minor",
  requires_reagreement: false,
  change_summary: "",
  content: "",
  is_active: true,
};

const TermDetailModal = ({
  termsId,
  open,
  onOpenChange,
}: {
  termsId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { data, isLoading, isError } = useGetAdminTermDetailQuery(termsId!, {
    skip: !open || termsId == null,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>약관 상세 정보</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            약관 내용을 불러오는 중...
          </div>
        ) : isError || !data ? (
          <div className="py-8 text-sm text-center text-red-600">
            약관 상세 정보를 불러오지 못했습니다.
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div>
                <span className="text-xs text-gray-500">약관 유형</span>
                <div className="font-semibold text-gray-900">
                  {TERM_TYPE_LABELS[data.type] || data.type}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">버전 / 변경 유형</span>
                <div className="font-semibold text-gray-900">
                  v{data.version} ({data.change_type})
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">재동의 필요 여부</span>
                <div className="mt-0.5">
                  <Badge variant="outline">
                    {data.requires_reagreement ? "재동의 필요" : "재동의 불필요"}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">활성 상태</span>
                <div className="mt-0.5">
                  <Badge
                    className={
                      data.is_active
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }
                  >
                    {data.is_active ? "활성" : "비활성"}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-500">변경 요약</Label>
              <div className="p-3 mt-1 border border-gray-200 rounded-lg bg-gray-50">
                {data.change_summary || "-"}
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-500">약관 전문</Label>
              <pre className="p-4 mt-1 overflow-auto text-xs whitespace-pre-wrap border border-gray-200 rounded-lg bg-gray-50 max-h-72">
                {data.content || "(내용 없음)"}
              </pre>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const AdminTermsPage = () => {
  const { data: rawTerms, isLoading } = useGetAdminTermsQuery();
  const [createTerm, { isLoading: isCreating }] = useCreateAdminTermMutation();
  const [updateTerm, { isLoading: isUpdating }] = useUpdateAdminTermMutation();

  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [detailId, setDetailId] = useState<number | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<AdminTermItem | null>(null);
  const [form, setForm] = useState<AdminTermPayload>(EMPTY_FORM);

  const termsList: AdminTermItem[] = useMemo(() => {
    if (Array.isArray(rawTerms)) return rawTerms;
    if (rawTerms && Array.isArray((rawTerms as any).results)) {
      return (rawTerms as any).results;
    }
    return [];
  }, [rawTerms]);

  const filteredTerms = useMemo(() => {
    return termsList.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (searchText.trim()) {
        const q = searchText.trim().toLowerCase();
        return (
          t.type.toLowerCase().includes(q) ||
          t.version.toLowerCase().includes(q) ||
          (t.change_summary || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [termsList, typeFilter, searchText]);

  const openCreateModal = () => {
    setEditingTerm(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEditModal = (term: AdminTermItem) => {
    setEditingTerm(term);
    setForm({
      type: term.type,
      version: term.version,
      change_type: term.change_type || "minor",
      requires_reagreement: Boolean(term.requires_reagreement),
      change_summary: term.change_summary || "",
      content: term.content || "",
      is_active: Boolean(term.is_active),
    });
    setFormOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type.trim() || !form.version.trim() || !form.content.trim()) {
      toast({
        variant: "destructive",
        title: "입력 확인",
        description: "약관 유형, 버전, 전문 내용은 필수입니다.",
      });
      return;
    }

    try {
      if (editingTerm) {
        await updateTerm({ termsId: editingTerm.id, data: form }).unwrap();
        toast({
          title: "약관 수정 완료",
          description: `v${form.version} 약관이 업데이트되었습니다.`,
        });
      } else {
        await createTerm(form).unwrap();
        toast({
          title: "약관 등록 완료",
          description: `새 약관(v${form.version})이 등록되었습니다.`,
        });
      }
      setFormOpen(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "저장 실패",
        description:
          err?.data?.message || "약관 저장 중 오류가 발생했습니다.",
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">약관 관리</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            서비스 약관 버전을 조회하고 신규 등록 또는 수정합니다.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreateModal}
          className="gap-1.5 text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          약관 신규 등록
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="유형, 버전, 변경 요약으로 필터링..."
                className="pl-9 h-9"
              />
            </div>
            <select
              aria-label="약관 유형 필터"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 text-sm bg-white border border-gray-300 rounded-md h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">유형: 전체</option>
              <option value="service">서비스 이용약관 (service)</option>
              <option value="privacy">개인정보 처리방침 (privacy)</option>
              <option value="marketing">마케팅 수신 동의 (marketing)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 약관 목록 */}
      <Card className="bg-white border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            약관 목록 ({filteredTerms.length}건)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              약관 목록을 불러오는 중...
            </div>
          ) : filteredTerms.length === 0 ? (
            <div className="py-16 text-sm text-center text-gray-500">
              등록된 약관이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-200 bg-gray-50">
                    <th className="px-3 py-2.5 font-medium">ID</th>
                    <th className="px-3 py-2.5 font-medium">유형</th>
                    <th className="px-3 py-2.5 font-medium">버전</th>
                    <th className="px-3 py-2.5 font-medium text-center">변경유형</th>
                    <th className="px-3 py-2.5 font-medium text-center">재동의</th>
                    <th className="px-3 py-2.5 font-medium">변경 요약</th>
                    <th className="px-3 py-2.5 font-medium text-center">상태</th>
                    <th className="px-3 py-2.5 font-medium text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTerms.map((term) => (
                    <tr key={term.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 text-gray-500">{term.id}</td>
                      <td className="px-3 py-3 font-medium text-gray-900">
                        {TERM_TYPE_LABELS[term.type] || term.type}
                        <span className="ml-1.5 text-xs text-gray-400">
                          ({term.type})
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-gray-900">
                        v{term.version}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Badge variant="outline" className="text-xs">
                          {term.change_type}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {term.requires_reagreement ? (
                          <Badge className="text-amber-700 bg-amber-50 border-amber-200">
                            필요
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">불필요</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600 max-w-[240px] truncate">
                        {term.change_summary || "-"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Badge
                          className={
                            term.is_active
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }
                        >
                          {term.is_active ? "활성" : "비활성"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            title="상세 보기"
                            onClick={() => setDetailId(term.id)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-50"
                            title="수정"
                            onClick={() => openEditModal(term)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세 보기 모달 */}
      <TermDetailModal
        termsId={detailId}
        open={detailId !== null}
        onOpenChange={(open) => !open && setDetailId(null)}
      />

      {/* 등록/수정 모달 */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTerm ? "약관 수정 / 버전 업데이트" : "약관 신규 등록"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="term-type">약관 유형</Label>
                <select
                  id="term-type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 text-sm bg-white border border-gray-300 rounded-md h-9"
                >
                  <option value="service">service (서비스 이용약관)</option>
                  <option value="privacy">privacy (개인정보 처리방침)</option>
                  <option value="marketing">marketing (마케팅 동의)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="term-version">버전</Label>
                <Input
                  id="term-version"
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                  placeholder="예: 1.1"
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="term-change-type">변경 유형</Label>
                <select
                  id="term-change-type"
                  value={form.change_type}
                  onChange={(e) =>
                    setForm({ ...form, change_type: e.target.value })
                  }
                  className="w-full px-3 text-sm bg-white border border-gray-300 rounded-md h-9"
                >
                  <option value="minor">minor</option>
                  <option value="major">major</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="term-summary">변경 요약</Label>
              <Input
                id="term-summary"
                value={form.change_summary}
                onChange={(e) =>
                  setForm({ ...form, change_summary: e.target.value })
                }
                placeholder="주요 개정 내용을 간단히 입력하세요."
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="term-content">약관 전문 (Markdown 또는 HTML)</Label>
              <textarea
                id="term-content"
                rows={10}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="약관 전문을 입력하세요..."
                className="w-full p-3 font-mono text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={form.requires_reagreement}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, requires_reagreement: Boolean(checked) })
                  }
                />
                <span>기존 회원 재동의 필요</span>
              </label>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={form.is_active}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, is_active: Boolean(checked) })
                  }
                />
                <span>활성 상태</span>
              </label>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={isCreating || isUpdating}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="text-white bg-blue-600 hover:bg-blue-700"
              >
                {isCreating || isUpdating
                  ? "저장 중..."
                  : editingTerm
                  ? "수정 저장"
                  : "등록하기"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTermsPage;
