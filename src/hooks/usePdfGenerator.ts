import { useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * PDF 생성 Hook
 * @returns generatePdf - PDF 생성 함수
 */
export const usePdfGenerator = () => {
    /**
     * PDF 생성 함수
     * @param elementId - 캡처할 HTML 요소의 ID
     * @param filename - 저장할 PDF 파일명 (기본값: "download.pdf")
     */
    const generatePdf = useCallback(async (elementId: string, filename = "download.pdf") => {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with ID "${elementId}" not found.`);
            return;
        }

        try {
            // HTML 요소를 캡처하여 캔버스 생성
            const canvas = await html2canvas(element, {
                scale: 2, // 고해상도 배율 설정
            });

            // 캡처된 내용을 이미지 데이터로 변환
            const imageData = canvas.toDataURL("image/png");

            // PDF 생성: A4 크기 (210mm x 297mm)
            const pdf = new jsPDF("portrait", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // PDF에 이미지 추가
            pdf.addImage(imageData, "PNG", 0, 0, pdfWidth, pdfHeight);

            // PDF 다운로드
            pdf.save(filename);
        } catch (error) {
            console.error("PDF 생성 중 오류가 발생했습니다:", error);
        }
    }, []);

    return { generatePdf };
};