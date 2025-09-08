export interface TableItem {
    id: number;
    item: string;
    compliance: string;
}

export const TABLE_DATA: TableItem[] = [
    { id: 1, item: "적절한 대체 텍스트 제공", compliance: "23/50" },
    { id: 2, item: "자막 제공", compliance: "40/50" },
    { id: 3, item: "표의 구성", compliance: "30/50" },
    { id: 4, item: "자동 재생 금지", compliance: "이슈 내용" },
    { id: 5, item: "텍스트 콘텐츠의 명도 대비", compliance: "Cell Text" },
    { id: 6, item: "키보드 사용 보장", compliance: "Cell Text" },
    { id: 7, item: "레이블 제공", compliance: "Cell Text" },
];

export const STYLES = {
    section: {
        hero: "flex flex-col items-center justify-center w-full px-6",
        feature: "w-full px-6 lg:px-8 py-24 bg-white",
        cta: "flex flex-col items-center justify-center min-h-screen px-4 py-20 text-center text-white bg-gray-900",
    },
    text: {
        title:
            "text-zinc-800 text-6xl font-bold leading-[80px] font-['Pretendard_Variable'] text-center max-w-[1044px]",
        subtitle:
            "text-gray-700 text-xl font-medium leading-loose font-['Pretendard_Variable'] text-center max-w-[754px]",
        button: "text-xl font-semibold leading-loose font-['Pretendard_Variable']",
        tableHeader:
            "text-xs font-medium font-['Pretendard_Variable'] text-gray-700",
        tableCell: "text-xs font-medium font-['Pretendard_Variable'] text-gray-700",
    },
    button: {
        base: "flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-colors",
        primary:
            "bg-gradient-to-b from-blue-700 to-indigo-400 text-white hover:from-blue-800 hover:to-indigo-700",
        secondary:
            "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
        error:
            "h-10 px-4 py-3 bg-blue-400 rounded-lg hover:bg-blue-500 transition-colors",
    },
} as const;