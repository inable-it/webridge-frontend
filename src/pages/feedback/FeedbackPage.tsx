import { useState, useId, useRef } from "react";
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
  // 접근성 지원 StarRating (한 칸씩 토글, Space/Enter OK, Tab 이동 OK)
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

    const activate = (value: number) => {
      if (!onRatingChange) return;
      // 같은 별을 다시 누르면 한 칸 취소, 아니면 해당 별로 설정
      onRatingChange(value === rating ? Math.max(0, value - 1) : value);
    };

    const handleKey = (e: React.KeyboardEvent, value: number) => {
      // 버튼에서 Space/Enter는 기본적으로 click을 발생시킴(키보드 클릭)
      // 여기서 직접 처리하고, 뒤이어 발생하는 click은 무시하여 중복 토글 방지
      if (e.key === " " || e.key === "Spacebar" || e.key === "Enter") {
        e.preventDefault();
        ignoreNextClick.current = true;
        activate(value);
      }
    };

    const handleClick = (
      e: React.MouseEvent<HTMLButtonElement>,
      value: number
    ) => {
      // 키보드 click이면 detail === 0
      if (ignoreNextClick.current || (e as any).detail === 0) {
        ignoreNextClick.current = false;
        return;
      }
      activate(value);
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
        {[1, 2, 3, 4, 5].map((num) => {
          const selected = rating >= num; // 채움 표시
          const current = rating === num; // 실제 선택(라디오)
          return (
            <button
              key={num}
              type="button"
              role="radio"
              aria-checked={current}
              aria-label={`${num}점`}
              title={`${num}점`}
              onKeyDown={(e) => handleKey(e, num)} // ✅ Space/Enter로 선택/취소
              onClick={(e) => handleClick(e, num)} // ✅ 마우스 클릭
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
      console.error("피드edback 수정 오류:", error);
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
