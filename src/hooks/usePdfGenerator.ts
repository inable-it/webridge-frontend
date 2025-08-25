import { useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

type GeneratePdfOptions = {
  /** html2canvas 기본 배율(최소치). 자동보정 전 하한. 기본 2 */
  baseScale?: number;
  /** 페이지 여백(mm) */
  marginMm?: number;
  /** 용지 크기 */
  size?: "a4" | "letter";
  /** 방향 */
  orientation?: "portrait" | "landscape";
  /** 목표 DPI (이미지 품질). 144면 충분히 선명하고 용량도 무난 */
  targetDpi?: number;
  /** 배경색(투명 방지) */
  backgroundColor?: string;
  /** 최대 배율(메모리 폭주 방지) */
  maxScale?: number;
};

export const usePdfGenerator = () => {
  const generatePdf = useCallback(
    async (
      elementIds: string | string[],
      filename = "accessibility-report.pdf",
      opts: GeneratePdfOptions = {}
    ) => {
      const ids = Array.isArray(elementIds) ? elementIds : [elementIds];

      const {
        baseScale = 2,
        marginMm = 10,
        size = "a4",
        orientation = "portrait",
        targetDpi = 144,
        backgroundColor = "#ffffff",
        maxScale = 4,
      } = opts;

      const pdf = new jsPDF(orientation, "mm", size);
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const contentWmm = pdfW - marginMm * 2;
      const contentHmm = pdfH - marginMm * 2;

      // PDF에 들어갈 폭(mm)을 목표 DPI로 환산 → 필요한 픽셀 폭
      const mmToPx = (mm: number, dpi: number) => Math.round((mm / 25.4) * dpi);
      const requiredPxWidth = mmToPx(contentWmm, targetDpi);

      let pagesAdded = 0;

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) {
          console.error(`Element with ID "${id}" not found.`);
          continue;
        }

        // 현재 렌더링된 CSS 폭(px)
        const cssWidth = Math.max(
          el.clientWidth,
          el.getBoundingClientRect().width || 0
        );

        // 🔧 확대(업스케일) 방지: PDF 폭에 맞추려면 최소 이만큼의 픽셀이 필요
        //    => html2canvas scale 을 자동 보정하여 "필요 픽셀 / 현재 CSS 폭" 이상으로 설정
        const autoScale = Math.max(
          baseScale,
          requiredPxWidth / Math.max(1, cssWidth)
        );
        const finalScale = Math.min(maxScale, autoScale);

        // 한 프레임 기다려 레이아웃 안정화
        await new Promise((r) => requestAnimationFrame(() => r(null)));

        const canvas = await html2canvas(el, {
          scale: finalScale, // 선명도 핵심
          backgroundColor, // 투명 방지
          useCORS: true,
          logging: false,
          windowWidth: el.scrollWidth, // 레이아웃 깨짐 방지
        });

        if (!canvas.width || !canvas.height) continue;

        // px/mm 매핑 (현재 캔버스 폭 == PDF 컨텐츠 폭에 대응시킴)
        const pxPerMm = canvas.width / contentWmm;
        const pageHeightPx = contentHmm * pxPerMm;

        let y = 0;
        while (y < canvas.height) {
          const sliceHeightPx = Math.min(pageHeightPx, canvas.height - y);

          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeightPx;

          const ctx = pageCanvas.getContext("2d");
          if (!ctx) break;

          ctx.drawImage(
            canvas,
            0,
            y,
            canvas.width,
            sliceHeightPx,
            0,
            0,
            canvas.width,
            sliceHeightPx
          );

          const imgData = pageCanvas.toDataURL("image/png"); // PNG: 선명/무손실
          const sliceHeightMm = sliceHeightPx / pxPerMm;

          if (pagesAdded > 0) pdf.addPage();
          pdf.addImage(
            imgData,
            "PNG",
            marginMm,
            marginMm,
            contentWmm,
            sliceHeightMm
          );

          pagesAdded++;
          y += sliceHeightPx;
        }
      }

      if (pagesAdded === 0) {
        console.error("No valid elements were captured. PDF not saved.");
        return;
      }
      pdf.save(filename);
    },
    []
  );

  return { generatePdf };
};
