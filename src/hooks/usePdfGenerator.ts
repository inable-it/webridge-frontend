import { useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

type GeneratePdfOptions = {
  baseScale?: number;
  marginMm?: number;
  size?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
  targetDpi?: number;
  backgroundColor?: string;
  maxScale?: number;
  /** 이미지 타입: 기본 JPEG (용량 절감) */
  imageType?: "JPEG" | "PNG";
  /** JPEG 품질(0~1): 기본 0.78 */
  imageQuality?: number;
};

const MAX_ROWS_PER_CHUNK = 160; // 대용량 행 분할

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
        imageType = "JPEG",
        imageQuality = 0.78,
      } = opts;

      const pdf = new jsPDF(
        orientation,
        "mm",
        size,
        true // ★ 스트림 압축
      );

      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const contentWmm = pdfW - marginMm * 2;
      const contentHmm = pdfH - marginMm * 2;

      const mmToPx = (mm: number, dpi: number) => Math.round((mm / 25.4) * dpi);
      const requiredPxWidth = mmToPx(contentWmm, targetDpi);

      let pagesAdded = 0;

      // 공통 캡처 유틸
      const captureAndAppend = async (
        rootEl: HTMLElement,
        onclone?: (doc: Document, clonedRoot: HTMLElement) => void
      ) => {
        const rectW = rootEl.getBoundingClientRect().width || 0;
        const cssWidth = Math.max(rootEl.clientWidth, rectW, 900);
        const windowWidth = Math.ceil(
          Math.max(rootEl.scrollWidth, cssWidth, 1200)
        );

        const autoScale = Math.max(
          baseScale,
          requiredPxWidth / Math.max(1, cssWidth)
        );
        const finalScale = Math.min(maxScale, autoScale);

        // 레이아웃 안정화 (2프레임)
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        await new Promise((r) => setTimeout(r, 0));

        const canvas = await html2canvas(rootEl, {
          scale: finalScale,
          backgroundColor,
          useCORS: true,
          logging: false,
          windowWidth,
          scrollX: 0,
          scrollY: 0,
          removeContainer: false,
          onclone: (clonedDoc) => {
            const clonedRoot = clonedDoc.getElementById(
              rootEl.id
            ) as HTMLElement | null;
            if (clonedRoot) {
              Object.assign(clonedRoot.style, {
                position: "static",
                left: "0px",
                top: "0px",
                transform: "none",
                zIndex: "0",
                display: "block",
                width: `${cssWidth}px`,
                backgroundColor: "#ffffff",
              });
              clonedRoot.removeAttribute("aria-hidden");
              onclone?.(clonedDoc, clonedRoot);
            }
          },
        });

        if (!canvas.width || !canvas.height) return;

        const pxPerMm = canvas.width / contentWmm;
        const pageHeightPx = contentHmm * pxPerMm;

        let y = 0;
        while (y < canvas.height) {
          const sliceHeightPx = Math.min(pageHeightPx, canvas.height - y);

          // 페이지 슬라이스 캔버스
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

          // ★ PNG → JPEG 전환 (+품질)
          const mime = imageType === "PNG" ? "image/png" : "image/jpeg";
          const imgData =
            imageType === "PNG"
              ? pageCanvas.toDataURL(mime) // PNG는 quality 미지원
              : pageCanvas.toDataURL(mime, imageQuality);

          const sliceHeightMm = sliceHeightPx / pxPerMm;

          if (pagesAdded > 0) pdf.addPage();
          // ★ addImage에 JPEG + 압축모드 전달
          pdf.addImage(
            imgData,
            imageType,
            marginMm,
            marginMm,
            contentWmm,
            sliceHeightMm,
            undefined,
            "FAST" // 압축 속성
          );

          pagesAdded++;
          y += sliceHeightPx;

          // 메모리 해제 힌트
          pageCanvas.width = 0;
          pageCanvas.height = 0;
        }

        // 캔버스 메모리 해제 힌트
        (canvas as any).width = 0;
        (canvas as any).height = 0;
      };

      for (const id of ids) {
        const rootEl = document.getElementById(id) as HTMLElement | null;
        if (!rootEl) {
          console.error(`Element with ID "${id}" not found.`);
          continue;
        }

        if (id === "detailReport") {
          // 상세보고서는 섹션/행 단위로 분할 캡처
          const sections = Array.from(
            rootEl.querySelectorAll<HTMLElement>("[data-pdf-section]")
          );

          for (let sIdx = 0; sIdx < sections.length; sIdx++) {
            const section = sections[sIdx];
            const rows = Array.from(
              section.querySelectorAll<HTMLElement>("[data-issue-row]")
            );

            // 이슈가 없으면 섹션만 보이게 해서 한 번에
            if (rows.length === 0) {
              await captureAndAppend(rootEl, (_doc, clonedRoot) => {
                const clonedSections = Array.from(
                  clonedRoot.querySelectorAll<HTMLElement>("[data-pdf-section]")
                );
                clonedSections.forEach((sec, i) => {
                  (sec.style as any).display = i === sIdx ? "block" : "none";
                });
              });
              continue;
            }

            // 행이 많으면 청크로 나눠 여러 번 캡처
            for (
              let start = 0;
              start < rows.length;
              start += MAX_ROWS_PER_CHUNK
            ) {
              const end = Math.min(start + MAX_ROWS_PER_CHUNK, rows.length);

              await captureAndAppend(rootEl, (_doc, clonedRoot) => {
                const clonedSections = Array.from(
                  clonedRoot.querySelectorAll<HTMLElement>("[data-pdf-section]")
                );
                clonedSections.forEach((sec, i) => {
                  (sec.style as any).display = i === sIdx ? "block" : "none";
                });

                const targetSection = clonedSections[sIdx];
                if (!targetSection) return;

                const clonedRows = Array.from(
                  targetSection.querySelectorAll<HTMLElement>(
                    "[data-issue-row]"
                  )
                );
                clonedRows.forEach((row, idx) => {
                  (row.style as any).display =
                    idx >= start && idx < end ? "grid" : "none";
                });
              });
            }
          }
        } else {
          // 요약/기타는 한 번에
          await captureAndAppend(rootEl);
        }
      }

      if (pagesAdded === 0) {
        console.error("No valid elements were captured. PDF not saved.");
        return;
      }

      // 저장
      pdf.save(filename);
    },
    []
  );

  return { generatePdf };
};
