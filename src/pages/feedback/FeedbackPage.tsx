import { useState, useId, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star, Edit, Trash2, X } from "lucide-react";
import {
  useCreateFeedbackMutation,
  useGetFeedbackListQuery,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
  type FeedbackResponse,
} from "@/features/api/feedbackApi";

const FeedbackPage = () => {
  // 피드백 작성 상태
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  // 피드백 수정 상태
  const [editingFeedback, setEditingFeedback] =
    useState<FeedbackResponse | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState("");

  // 삭제 확인 모달 상태
  const [deletingFeedbackId, setDeletingFeedbackId] = useState<number | null>(
    null
  );

  // API 훅들
  const [createFeedback, { isLoading: isCreating }] =
    useCreateFeedbackMutation();
  const [updateFeedback, { isLoading: isUpdating }] =
    useUpdateFeedbackMutation();
  const [deleteFeedback, { isLoading: isDeleting }] =
    useDeleteFeedbackMutation();

  // 피드백 목록 조회
  const {
    data: feedbackList,
    isLoading: isLoadingList,
    refetch,
  } = useGetFeedbackListQuery({
    page: 1,
    page_size: 20,
  });

  // 의견 작성/수정용 id
  const createTextId = useId();
  const createCountId = useId();
  const editTextId = useId();
  const editCountId = useId();

  // ─────────────────────────────
  // 접근성 지원 StarRating (한 칸씩 토글 X → 동일 별 재입력 시 “취소(0점)”, 포커스 유지)
  // ─────────────────────────────
  const StarRating = ({
    rating,
    onRatingChange,
    readonly = false,
    groupLabel = "평점 선택",
  }: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    groupLabel?: string;
  }) => {
    const ignoreNextClick = useRef(false);

    // roving tabindex: 현재 탭으로 진입할 별 인덱스(0-based)
    const [activeIndex, setActiveIndex] = useState(Math.max(0, rating - 1));
    const btnRefs = useRef<HTMLButtonElement[]>([]);

    useEffect(() => {
      // 외부에서 rating이 바뀌면 해당 별을 활성 탭 대상으로 설정
      if (rating > 0) {
        setActiveIndex(rating - 1);
      }
      // rating === 0인 경우에는 activeIndex를 바꾸지 않아 포커스 유지
    }, [rating]);

    const focusIndex = (idx: number) => {
      const total = 5;
      const clamped = Math.max(0, Math.min(total - 1, idx));
      setActiveIndex(clamped);
      const btn = btnRefs.current[clamped];
      if (btn) btn.focus();
    };

    const setValue = (value: number) => {
      if (!onRatingChange) return;
      onRatingChange(Math.max(0, value));
    };

    const activateByClick = (value: number) => {
      // 동일 별 클릭 시 “취소(0점)”; 아니면 해당 값 선택
      if (!onRatingChange) return;
      const next = value === rating ? 0 : value;
      setValue(next);
      // rating이 0이 되어도 activeIndex는 그대로여서 포커스 불변
    };

    const handleActionKey = (e: React.KeyboardEvent, value: number) => {
      const isSpace = e.key === " " || e.key === "Spacebar";
      const isEnter = e.key === "Enter";
      if (isSpace || isEnter) {
        e.preventDefault();
        e.stopPropagation();
        ignoreNextClick.current = true;

        if (!onRatingChange) return;
        // 동일 별 → 0(취소), 그 외 → 해당 값
        const next = value === rating ? 0 : value;
        setValue(next);
        // 포커스는 같은 버튼에 그대로 (activeIndex 변경 없음)
      }
    };

    const handleTabRoving = (e: React.KeyboardEvent, idx: number) => {
      if (e.key !== "Tab") return;
      const isShift = e.shiftKey;
      const total = 5;

      // 그룹 경계에서는 기본 동작 허용
      if ((isShift && idx === 0) || (!isShift && idx === total - 1)) return;

      // 그룹 내 이동은 기본 동작 차단하고 다음/이전 별로 포커스만 이동 (값 변경 없음)
      e.preventDefault();
      e.stopPropagation();
      focusIndex(isShift ? idx - 1 : idx + 1);
    };

    const handleKeyUp = (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleClick = (
      e: React.MouseEvent<HTMLButtonElement>,
      value: number
    ) => {
      // 키보드 Space/Enter 직후 발생하는 click 무시
      if (ignoreNextClick.current || (e as any).detail === 0) {
        ignoreNextClick.current = false;
        return;
      }
      activateByClick(value);
    };

    if (readonly) {
      return (
        <div
          role="img"
          aria-label="평점"
          aria-readonly="true"
          className="flex gap-1"
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <Star
              key={num}
              aria-hidden="true"
              className={`w-5 h-5 ${
                rating >= num
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-700"
              }`}
            />
          ))}
        </div>
      );
    }

    return (
      <div role="radiogroup" aria-label={groupLabel} className="flex gap-1">
        {[1, 2, 3, 4, 5].map((num, idx) => {
          const selected = rating >= num; // 시각적 채움
          const current = rating === num; // 실제 선택(라디오)
          const isTabStop = idx === activeIndex;

          return (
            <button
              key={num}
              ref={(el) => {
                if (el) btnRefs.current[idx] = el;
              }}
              type="button"
              role="radio"
              aria-checked={current}
              aria-keyshortcuts="Tab, Shift+Tab, Space"
              aria-label={`${num}점`}
              title={`${num}점`}
              tabIndex={isTabStop ? 0 : -1} // roving tabindex 핵심
              onFocus={() => setActiveIndex(idx)}
              onKeyDown={(e) => {
                // 탭: 포커스만 이동, 값 변경 없음
                handleTabRoving(e, idx);
                // Space/Enter: 동일 별 → 0(취소), 아니면 값 설정
                handleActionKey(e, num);
              }}
              onKeyUp={handleKeyUp}
              onClick={(e) => handleClick(e, num)}
              className={`p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                current ? "ring-1 ring-blue-500" : ""
              }`}
            >
              <Star
                aria-hidden="true"
                className={`w-5 h-5 ${
                  selected ? "text-yellow-400 fill-yellow-400" : "text-gray-700"
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  // 등록
  const handleSubmit = async () => {
    if (!text.trim()) return alert("피드백 내용을 입력해주세요.");
    if (rating === 0) return alert("평점을 선택해주세요.");
    try {
      await createFeedback({ content: text, rating }).unwrap();
      setText("");
      setRating(0);
      alert("피드백이 등록되었습니다!");
      refetch();
    } catch (error) {
      console.error("피드백 등록 오류:", error);
      alert("피드백 등록 중 오류가 발생했습니다.");
    }
  };

  // 수정 시작/취소/저장
  const startEdit = (feedback: FeedbackResponse) => {
    setEditingFeedback(feedback);
    setEditRating(feedback.rating);
    setEditText(feedback.content);
  };
  const cancelEdit = () => {
    setEditingFeedback(null);
    setEditRating(0);
    setEditText("");
  };
  const saveEdit = async () => {
    if (!editingFeedback) return;
    if (!editText.trim()) return alert("피드백 내용을 입력해주세요.");
    if (editRating === 0) return alert("평점을 선택해주세요.");
    try {
      await updateFeedback({
        id: editingFeedback.id,
        data: { content: editText, rating: editRating },
      }).unwrap();
      alert("피드백이 수정되었습니다!");
      cancelEdit();
      refetch();
    } catch (error) {
      console.error("피드백 수정 오류:", error);
      alert("피드백 수정 중 오류가 발생했습니다.");
    }
  };

  // 삭제
  const confirmDelete = (id: number) => setDeletingFeedbackId(id);
  const handleDelete = async () => {
    if (!deletingFeedbackId) return;
    try {
      await deleteFeedback(deletingFeedbackId).unwrap();
      alert("피드백이 삭제되었습니다!");
      setDeletingFeedbackId(null);
      refetch();
    } catch (error) {
      console.error("피드백 삭제 오류:", error);
      alert("피드백 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-8 bg-[#ecf3ff] min-h-screen">
      <div className="mx-auto">
        <h2 className="mb-6 text-lg font-semibold">
          WEBridge 사용 후 느낀 점을 남겨주세요.
        </h2>

        {/* 작성 영역 */}
        <div className="p-6 mb-6 space-y-4 bg-white border rounded-lg">
          <div>
            <p id="create-rating-label" className="mb-2 font-semibold">
              평점
            </p>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              groupLabel="평점 선택"
            />
          </div>

          <div>
            <label htmlFor={createTextId} className="block mb-2 font-semibold">
              의견
            </label>
            <textarea
              id={createTextId}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="자유로운 의견을 500자 이내로 남겨주세요!"
              maxLength={500}
              rows={5}
              required
              aria-describedby={createCountId}
              aria-label="자유로운 의견을 500자 이내로 남겨주세요!"
              className="w-full px-4 pt-4 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end">
            <span
              id={createCountId}
              className="mr-2 text-sm text-gray-700"
              aria-live="polite"
            >
              {text.length} / 500
            </span>
            <Button
              onClick={handleSubmit}
              disabled={isCreating}
              className="bg-[#0055FF] text-white hover:bg-[#0040CC]"
            >
              {isCreating ? "등록 중..." : "등록하기"}
            </Button>
          </div>
        </div>

        {/* 나의 피드백 목록 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">나의 피드백</h3>

          {isLoadingList ? (
            <div className="py-8 text-center">
              <p>피드백을 불러오는 중...</p>
            </div>
          ) : feedbackList?.results?.length === 0 ? (
            <div className="py-8 text-center text-gray-700">
              <p>아직 작성한 피드백이 없습니다.</p>
            </div>
          ) : (
            feedbackList?.results?.map((feedback) => (
              <div key={feedback.id} className="p-6 bg-white border rounded-lg">
                {editingFeedback?.id === feedback.id ? (
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 font-semibold">평점</p>
                      <StarRating
                        rating={editRating}
                        onRatingChange={setEditRating}
                        groupLabel="평점 수정"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={editTextId}
                        className="block mb-2 font-semibold"
                      >
                        의견 수정
                      </label>
                      <textarea
                        id={editTextId}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder="피드백 내용을 입력해주세요"
                        maxLength={500}
                        rows={4}
                        required
                        aria-describedby={editCountId}
                        className="w-full px-4 pt-4 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span
                          id={editCountId}
                          className="text-sm text-gray-700"
                          aria-live="polite"
                        >
                          {editText.length} / 500
                        </span>
                        <div className="flex gap-2">
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                            size="sm"
                          >
                            취소하기
                          </Button>
                          <Button
                            onClick={saveEdit}
                            disabled={isUpdating}
                            size="sm"
                            className="bg-[#0055FF] text-white hover:bg-[#0040CC]"
                          >
                            {isUpdating ? "수정 중..." : "수정하기"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="mb-1 font-semibold">평점</p>
                        <StarRating rating={feedback.rating} readonly />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => startEdit(feedback)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          수정하기
                        </Button>
                        <Button
                          onClick={() => confirmDelete(feedback.id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          삭제하기
                        </Button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {feedback.content}
                      </p>
                    </div>
                    <div className="text-xs text-gray-700">
                      작성일:{" "}
                      {new Date(feedback.created_at).toLocaleDateString(
                        "ko-KR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                      {feedback.updated_at !== feedback.created_at && (
                        <span className="ml-2">
                          (수정됨:{" "}
                          {new Date(feedback.updated_at).toLocaleDateString(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                          )
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 삭제 확인 모달 */}
        {deletingFeedbackId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative p-8 bg-white rounded-xl w-80">
              <button
                onClick={() => setDeletingFeedbackId(null)}
                className="absolute text-gray-700 top-4 right-4 hover:text-gray-900"
                aria-label="닫기"
                title="닫기"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="mt-4 mb-8 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  정말로 삭제하시겠습니까?
                </h3>
              </div>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full h-12 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {isDeleting ? "삭제 중..." : "삭제하기"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
