import type { ComponentType } from "react";
import AltTextDetail from "@/pages/scan-detail/components/AltTextDetail";
import ContrastDetail from "@/pages/scan-detail/components/ContrastDetail";
import KeyboardDetail from "@/pages/scan-detail/components/KeyboardDetail";
import LabelDetail from "@/pages/scan-detail/components/LabelDetail";
import TableDetail from "@/pages/scan-detail/components/TableDetail";
import VideoDetail from "@/pages/scan-detail/components/VideoDetail";
import BasicLanguageDetail from "@/pages/scan-detail/components/BasicLanguageDetail";
import MarkupErrorDetail from "@/pages/scan-detail/components/MarkupErrorDetail";
import HeadingDetail from "@/pages/scan-detail/components/HeadingDetail";
import ResponseTimeDetail from "@/pages/scan-detail/components/ResponseTimeDetail";
import PauseControlDetail from "@/pages/scan-detail/components/PauseControlDetail";
import FlashingDetail from "@/pages/scan-detail/components/FlashingDetail";
import AutoPlayDetail from "@/pages/scan-detail/components/AutoPlayDetail";
import React from "react";

type CategoryInfo = {
  title: string;
  component: ComponentType<any>;
};

export const getCategoryInfo = (category: string): CategoryInfo => {
  const map: Record<string, CategoryInfo> = {
    alt_text: { title: "적절한 대체 텍스트 제공", component: AltTextDetail },
    contrast: { title: "텍스트 콘텐츠의 명도 대비", component: ContrastDetail },
    keyboard: { title: "키보드 사용 보장", component: KeyboardDetail },
    label: { title: "레이블 제공", component: LabelDetail },
    table: { title: "표의 구성", component: TableDetail },
    auto_play: { title: "자동 재생 금지", component: AutoPlayDetail },
    video: { title: "자막 제공", component: VideoDetail },
    basic_language: { title: "기본 언어 표시", component: BasicLanguageDetail },
    markup_error: { title: "마크업 오류 방지", component: MarkupErrorDetail },
    heading: { title: "제목 제공", component: HeadingDetail },
    response_time: { title: "응답 시간 조절", component: ResponseTimeDetail },
    pause_control: { title: "정지 기능 제공", component: PauseControlDetail },
    flashing: { title: "깜빡임과 번쩍임 사용 제한", component: FlashingDetail },
  };

  return (
    map[category] || {
      title: "알 수 없는 검사 항목",
      component: UnsupportedCategoryDetail,
    }
  );
};

const UnsupportedCategoryDetail: React.FC = () => {
  return React.createElement("div", null, "지원하지 않는 검사 항목입니다.");
};
