import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, ExternalLink, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useGetScanDetailQuery } from "@/features/api/scanApi";
import type { 
  AltTextResult,
  ContrastResult,
  KeyboardResult,
  LabelResult,
  TableResult,
  VideoResult,
  BasicLanguageResult,
  MarkupErrorResult,
  HeadingResult,
  ResponseTimeResult,
  PauseControlResult,
  FlashingResult,
  ComplianceStatus,
  AccessibilityScanDetail
} from "@/features/api/scanApi";
import { toast } from "@/hooks/use-toast";

// 타입 정의
interface AltTextDetailProps {
  results: AltTextResult[];
  scanUrl: string;
}

interface ContrastDetailProps {
  results: ContrastResult[];
}

interface KeyboardDetailProps {
  results: KeyboardResult[];
}

interface LabelDetailProps {
  results: LabelResult[];
}

interface TableDetailProps {
  results: TableResult[];
}

interface VideoDetailProps {
  results: VideoResult[];
}

interface BasicLanguageDetailProps {
  results: BasicLanguageResult[];
}

interface MarkupErrorDetailProps {
  results: MarkupErrorResult[];
}

interface HeadingDetailProps {
  results: HeadingResult[];
}

interface ResponseTimeDetailProps {
  results: ResponseTimeResult[];
}

interface PauseControlDetailProps {
  results: PauseControlResult[];
}

interface FlashingDetailProps {
  results: FlashingResult[];
}

interface CategoryInfo {
  title: string;
  component: React.ComponentType<any>;
}

// 대체 텍스트 상세 컴포넌트
const AltTextDetail = ({ results, scanUrl }: AltTextDetailProps) => {
  const getComplianceColor = (compliance: ComplianceStatus) => {
    switch (compliance) {
      case 0: return 'text-green-600 bg-green-50';
      case 1: return 'text-yellow-600 bg-yellow-50';
      case 2: return 'text-orange-600 bg-orange-50';
      case 3: return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getComplianceIcon = (compliance: ComplianceStatus) => {
    switch (compliance) {
      case 0: return <CheckCircle className="w-4 h-4" />;
      case 1: case 2: case 3: return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // 이미지 URL을 절대 경로로 변환하는 함수
  const getAbsoluteImageUrl = (imgUrl: string, baseUrl: string) => {
    try {
      // 이미 절대 URL인 경우
      if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
        return imgUrl;
      }
      
      // 상대 경로인 경우 base URL과 결합
      const base = new URL(baseUrl);
      const absoluteUrl = new URL(imgUrl, base.origin);
      return absoluteUrl.href;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // URL 파싱 실패 시 원본 반환
      return imgUrl;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-md text-blue-700 font-bold">[ 적절한 대체텍스트 제공 ] 수정 가이드</span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ WEBridge는 [적절한 대체 텍스트 제공] 미준수 여부를 다음 기준으로 확인해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 이미지에 alt 속성이 아예 없는 경우</li>
          <li>• 이미지에 입력된 대체 텍스트가 이미지의 의미와 맞지 않는 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.</span>
        </div>
         <ul className="text-sm space-y-1">
          <li>• 모든 의미있는 이미지에는 alt 속성을 통해 대체텍스트를 입력해야 해요.</li>
          <li>• 대체텍스트는 이미지의 의미나 용도를 동등하게 인식할 수 있도록 작성해야 해요.</li>
          <li>• 대체텍스트는 간단명료하게 제공하는 것이 좋아요.</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.</span>
        </div>
         <ul className="text-sm space-y-1">
          <li>• 이미지 외에도 동영상 등의 텍스트가 아닌 콘텐츠에도 대체 텍스트가 필요해요.</li>
          <li>• 수어 영상처럼 이미 내용을 전달하고 있는 콘텐츠에는 대체 텍스트를 따로 넣지 않아도 괜찮아요.</li>
          <li>• 장식용 이미지는 alt를 빈값으로 설정하면, 보조기술이 불필요한 정보를 건너뛸 수 있어요.</li>
        </ul>
      </div>

      {results.map((result: AltTextResult, index: number) => (
        <Card key={result.id} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                오류 항목 {index + 1}
              </CardTitle>
              <Badge className={`${getComplianceColor(result.compliance)} flex items-center gap-1`}>
                {getComplianceIcon(result.compliance)}
                {result.compliance_display}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* 이미지 미리보기와 정보 */}
            <div className="flex gap-4">
              {/* 이미지 미리보기 */}
              <div className="flex-shrink-0">
                <label className="text-xs font-medium text-gray-500 block mb-1">이미지 미리보기</label>
                <div className="w-32 h-24 border rounded overflow-hidden bg-gray-50 flex items-center justify-center relative">
                  <img
                    src={getAbsoluteImageUrl(result.img_url, scanUrl)}
                    alt="검사 대상 이미지"
                    className="max-w-full max-h-full object-contain"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const nextElement = target.nextElementSibling as HTMLElement | null;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="hidden absolute inset-0 items-center justify-center text-xs text-gray-400 text-center p-2">
                    <div>
                      <div className="mb-1">🖼️</div>
                      <div>이미지를 불러올 수 없습니다</div>
                    </div>
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-400 text-center">
                  {result.img_url.startsWith('http') ? '외부 이미지' : '사이트 내 이미지'}
                </div>
              </div>

              {/* 이미지 정보 */}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">이미지 URL</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-sm break-all font-mono text-xs">
                    &lt;img alt="" src="{result.img_url.length > 100 ? result.img_url.substring(0, 100) + '...' : result.img_url}" style="width: 776px; height: 448px; border: none; filter: none;"&gt;
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500">현재 대체 텍스트</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                    {result.alt_text || '(없음)'}
                  </div>
                </div>
              </div>
            </div>
            
            {result.suggested_alt && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-blue-700">⭐ WEBridge AI 대체텍스트 제안</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(`alt="${result.suggested_alt}"`);
                      toast({ title: "복사 완료", description: "대체 텍스트가 클립보드에 복사되었습니다." });
                    }}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    복사
                  </Button>
                </div>
                <div className="text-sm text-blue-800 font-mono bg-white p-2 rounded border">
                  alt="{result.suggested_alt}"
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// 색상 대비 상세 컴포넌트
const ContrastDetail = ({ results }: ContrastDetailProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-md text-orange-700 font-bold">[ 텍스트 콘텐츠의 명도 대비 ] 수정 가이드</span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ WEBridge는 [텍스트 콘텐츠의 명도대비] 미준수 여부를 다음 기준으로 확인해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 텍스트 콘텐츠와 배경 간의 명도 대비가 4.5 대 1 미만인 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 텍스트 콘텐츠(텍스트 및 텍스트 이미지)와 배경 간의 명도 대비가 4.5 대 1 이상이 되도록 색상을 사용해야 해요.</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 굵은 텍스트 폰트(18pt 이상 또는 14pt 이상)를 이용한다면 명도 대비를 3 대 1까지 낮출 수 있어요.</li>
          <li>• 화면 확대가 가능한 텍스트 콘텐츠라면 명도 대비를 3 대 1까지 낮출 수 있어요.</li>
          <li>• 로고, 장식 목적의 콘텐츠, 마우스나 키보드를 활용하여 초점을 받았을 때 명도 대비가 커지는 콘텐츠 등은 예외로 해요.</li>
        </ul>
      </div>

      {results.map((result: ContrastResult, index: number) => (
        <Card key={result.id} className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                오류 항목 {index + 1}
              </CardTitle>
              <Badge className={result.wcag_compliant ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}>
                {result.wcag_compliant ? (
                  <><CheckCircle className="w-4 h-4 mr-1" />WCAG 준수</>
                ) : (
                  <><XCircle className="w-4 h-4 mr-1" />WCAG 미준수</>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500">텍스트 내용</label>
              <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                "{result.text_content}"
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">전경색</label>
                <div className="mt-1 flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: result.foreground_color }}
                  ></div>
                  <span className="text-sm font-mono">{result.foreground_color}</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-500">배경색</label>
                <div className="mt-1 flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: result.background_color }}
                  ></div>
                  <span className="text-sm font-mono">{result.background_color}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded p-3">
              <div className="text-xs font-medium text-purple-700 mb-1">대비율 분석</div>
              <div className="text-lg font-bold text-purple-800">
                {result.contrast_ratio.toFixed(2)}:1
              </div>
              <div className="text-xs text-purple-600 mt-1">
                {result.wcag_compliant 
                  ? '✓ WCAG 기준 (4.5:1) 이상입니다' 
                  : '✗ WCAG 기준 (4.5:1) 미만입니다'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// 키보드 접근성 상세 컴포넌트
const KeyboardDetail = ({ results }: KeyboardDetailProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-md text-teal-700 font-bold">[ 키보드 사용 보장 ] 수정 가이드</span>
      </div>
      <div className="flex items-center gap-2 mt-4 mb-2">
        <span className="text-sm font-bold">ℹ️ WEBridge는 [키보드 사용 보장] 미준수 여부를 다음 기준으로 확인해요.</span>
      </div>
      <ul className="text-sm space-y-1">
        <li>• 웹 사이트 내 Tab 키로 접근이 불가능한 요소가 있는 경우</li>
      </ul>
      <div className="flex items-center gap-2 mt-4 mb-2">
        <span className="text-sm font-bold">ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.</span>
      </div>
      <ul className="text-sm space-y-1">
        <li>• 웹 페이지에서 제공하는 모든 기능은 Tab키로 접근이 가능해야 해요.</li>
        <li>• 예: 마우스 오버 시 드롭 다운 메뉴가 노출되는 경우, 키보드 접근 시에도 드롭 다운 메뉴가 노출되고 메뉴에 접근 가능하도록 구현해야 함</li>
      </ul>
      <div className="flex items-center gap-2 mt-4 mb-2">
        <span className="text-sm font-bold">💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.</span>
      </div>
      <ul className="text-sm space-y-1">
        <li>• 모든 기능은 키보드만으로도 사용할 수 있어야 하며, Tab 키를 이용한 이동뿐 아니라 클릭과 같은 동작도 키보드로 실행할 수 있어야 해요.</li>
        <li>• 위치 지정 도구의 커서 궤적이 중요한 역할을 하거나, 움직임 측정 센서를 이용하는 콘텐츠는 검사항목의 예외 콘텐츠로 간주해요.</li>
        <li>• 예외 콘텐츠의 경우에도 해당 기능을 제외한 나머지 사용자 인터페이스는 키보드만으로도 사용할 수 있어야 해요.</li>
      </ul>
    </div>

      {results.map((result: KeyboardResult, index: number) => (
        <Card key={result.id} className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                오류 항목 {index + 1} - {result.element_type}
              </CardTitle>
              <Badge className={result.accessible ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}>
                {result.accessible ? (
                  <><CheckCircle className="w-4 h-4 mr-1" />접근 가능</>
                ) : (
                  <><XCircle className="w-4 h-4 mr-1" />접근 불가</>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-xs font-medium text-gray-500">검사 결과</label>
              <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                {result.message}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// 레이블 상세 컴포넌트
const LabelDetail = ({ results }: LabelDetailProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-md text-indigo-700 font-bold">[ 레이블 제공 ] 수정 가이드</span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ WEBridge는 [레이블 제공] 미준수 여부를 다음 기준으로 확인해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 입력 서식과 레이블이 1:1로 매칭되어 있지 않은 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 레이블과 사용자 입력 간의 관계를 대응시켜야 해요.</li>
          <li>• 레이블을 제공하고 label for 값과 input의 id 값을 동일하게 제공해야 해요.</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 레이블과 입력 서식이 1:다 매칭인 경우 각 입력 서식에 대해 title을 제공해야 해요.</li>
          <li>• 레이블이 시각적으로 노출되지 않은 경우 각 입력 서식에 대해 title을 제공해야 해요.</li>
        </ul>
      </div>

     {results.map((result: LabelResult, index: number) => (
       <Card key={result.id} className="border-l-4 border-l-orange-500">
         <CardHeader className="pb-3">
           <div className="flex items-center justify-between">
             <CardTitle className="text-sm font-medium">
               오류 항목 {index + 1} - {result.input_type}
             </CardTitle>
             <Badge className={result.label_present ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}>
               {result.label_present ? (
                 <><CheckCircle className="w-4 h-4 mr-1" />레이블 있음</>
               ) : (
                 <><XCircle className="w-4 h-4 mr-1" />레이블 없음</>
               )}
             </Badge>
           </div>
         </CardHeader>
         <CardContent>
           <div>
             <label className="text-xs font-medium text-gray-500">검사 결과</label>
             <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
               {result.message}
             </div>
           </div>
         </CardContent>
       </Card>
     ))}
   </div>
 );
};

// 표 구조 상세 컴포넌트
const TableDetail = ({ results }: TableDetailProps) => {
 return (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-md text-purple-700 font-bold">[ 표의 구성 ] 수정 가이드</span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ WEBridge는 [표의 구성] 미준수 여부를 다음 기준으로 확인해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 표의 제목 셀과 데이터 셀이 구분되지 않은 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 제목 셀은 th로 내용 셀은 td로 마크업 해야 해요.</li>
          <li>• 제목 셀이 행과 열에 모두 있는 경우 scope로 행 제목인지 열 제목인지 구분해야 해요.</li>
          <li>• 복잡한 표의 경우 id와 headers 속성을 이용하면 제목 셀과 내용 셀을 정확하게 연결할 수 있어요.</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 표의 내용, 구조 등 표의 정보를 제공하여 표의 이용 방법을 예측할 수 있도록 해야 해요.</li>
          <li>• caption으로 제목을, table의 summary 속성으로 요약 정보를 제공해야 해요.</li>
          <li>• 마크업 시 데이터 테이블과, 레이아웃 테이블이 혼동되지 않도록 유의해야 해요.</li>
        </ul>
    </div>

     {results.map((result: TableResult, index: number) => (
       <Card key={result.id} className="border-l-4 border-l-indigo-500">
         <CardHeader className="pb-3">
           <div className="flex items-center justify-between">
             <CardTitle className="text-sm font-medium">
               오류 항목 {index + 1}
             </CardTitle>
             <Badge className={result.compliant ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}>
               {result.compliant ? (
                 <><CheckCircle className="w-4 h-4 mr-1" />구조 준수</>
               ) : (
                 <><XCircle className="w-4 h-4 mr-1" />구조 미준수</>
               )}
             </Badge>
           </div>
         </CardHeader>
         <CardContent className="space-y-3">
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-medium text-gray-500">헤더 수</label>
               <div className="mt-1 text-lg font-semibold">
                 {result.headers_count}개
               </div>
             </div>
             
             <div>
               <label className="text-xs font-medium text-gray-500">행 수</label>
               <div className="mt-1 text-lg font-semibold">
                 {result.rows_count}개
               </div>
             </div>
           </div>
           
           <div>
             <label className="text-xs font-medium text-gray-500">검사 결과</label>
             <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
               {result.message}
             </div>
           </div>
         </CardContent>
       </Card>
     ))}
   </div>
 );
};

// 비디오 접근성 상세 컴포넌트
const VideoDetail = ({ results }: VideoDetailProps) => {
 return (
   <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-md text-green-700 font-bold">[ 자막 제공 ] 수정 가이드</span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ WEBridge는 [자막 제공] 미준수 여부를 다음 기준으로 확인해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 동영상에 script가 포함되어 있지 않은 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
            <span className="text-sm font-bold">ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.</span>
        </div>
          <ul className="text-sm space-y-1">
            <li>• 멀티미디어 콘텐츠를 제공할 때는 자막, 대본, 수어 중 한 가지 이상의 대체 수단을 제공해야 해요.</li>
            <li>• 대사 없이 영상만 제공하는 경우, 화면해설(텍스트, 오디오, 대본)을 제공해야 해요.</li>
            <li>• 음성만 제공하는 경우, 대본 또는 수어를 제공해야 해요.</li>
        </ul>
          <div className="flex items-center gap-2 mt-4 mb-2">
            <span className="text-sm font-bold">💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.</span>
          </div>
        <ul className="text-sm space-y-1">
          <li>• 대체 수단(자막, 대본, 수어)을 제공할 때는, 멀티미디어 콘텐츠와 동등한 내용을 제공해야 해요.</li>
          <li>• 가장 바람직한 방법은 폐쇄자막을 오디오와 동기화하여 제공하는 것이에요.</li>
          <li>• 대체수단을 여러 언어로 제공하면, 사용자는 자신이 사용하길 원하는 언어를 선택할 수 있어야 해요.</li>
        </ul>
    </div>

     {results.map((result: VideoResult, index: number) => (
       <Card key={result.id} className="border-l-4 border-l-pink-500">
         <CardHeader className="pb-3">
           <CardTitle className="text-sm font-medium">
             오류 항목 {index + 1}
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-3">
           {result.video_url && (
             <div>
               <label className="text-xs font-medium text-gray-500">비디오 URL</label>
               <div className="mt-1 p-2 bg-gray-50 rounded text-sm break-all">
                 {result.video_url}
               </div>
             </div>
           )}
           
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <div className="flex items-center gap-2">
                 {result.has_thumbnail ? (
                   <CheckCircle className="w-4 h-4 text-green-600" />
                 ) : (
                   <XCircle className="w-4 h-4 text-red-600" />
                 )}
                 <span className="text-sm">썸네일</span>
               </div>
               
               <div className="flex items-center gap-2">
                 {result.has_transcript ? (
                   <CheckCircle className="w-4 h-4 text-green-600" />
                 ) : (
                   <XCircle className="w-4 h-4 text-red-600" />
                 )}
                 <span className="text-sm">자막/대본</span>
               </div>
               
               <div className="flex items-center gap-2">
                 {result.has_audio_description ? (
                   <CheckCircle className="w-4 h-4 text-green-600" />
                 ) : (
                   <XCircle className="w-4 h-4 text-red-600" />
                 )}
                 <span className="text-sm">오디오 설명</span>
               </div>
             </div>
             
             <div className="space-y-2">
               <div className="flex items-center gap-2">
                 {result.keyboard_accessible ? (
                   <CheckCircle className="w-4 h-4 text-green-600" />
                 ) : (
                   <XCircle className="w-4 h-4 text-red-600" />
                 )}
                 <span className="text-sm">키보드 접근</span>
               </div>
               
               <div className="flex items-center gap-2">
                 {result.has_aria_label ? (
                   <CheckCircle className="w-4 h-4 text-green-600" />
                 ) : (
                   <XCircle className="w-4 h-4 text-red-600" />
                 )}
                 <span className="text-sm">ARIA 레이블</span>
               </div>
               
               <div className="flex items-center gap-2">
                 {result.autoplay_disabled ? (
                   <CheckCircle className="w-4 h-4 text-green-600" />
                 ) : (
                   <XCircle className="w-4 h-4 text-red-600" />
                 )}
                 <span className="text-sm">자동재생 비활성화</span>
               </div>
             </div>
           </div>
         </CardContent>
       </Card>
     ))}
   </div>
 );
};

// 기본 언어 표시 상세 컴포넌트
const BasicLanguageDetail = ({ results }: BasicLanguageDetailProps) => {
 return (
   <div className="space-y-4">
     <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-md text-sky-700 font-bold">[ 기본 언어 표시 ] 수정 가이드</span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ WEBridge는 [기본 언어 표시] 미준수 여부를 다음 기준으로 확인해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 웹 페이지의 기본 언어 표시가 명시되어 있지 않은 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 웹 페이지에서 제공하는 콘텐츠에 적용되는 기본 언어를 반드시 정의해야 해요.</li>
          <li>• 기본 언어 표시는 HTML 태그에 lang 속성을 사용하여 "ISO639-1"에서 지정한 두 글자로 된 언어 코드로 제공할 수 있어요.</li>
        </ul>
      </div>

     {results.map((result: BasicLanguageResult, index: number) => (
       <Card key={result.id} className="border-l-4 border-l-teal-500">
         <CardHeader className="pb-3">
           <div className="flex items-center justify-between">
             <CardTitle className="text-sm font-medium">
               오류 항목 {index + 1}
             </CardTitle>
             <Badge className={result.compliant ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}>
               {result.compliant ? (
                 <><CheckCircle className="w-4 h-4 mr-1" />준수</>
               ) : (
                 <><XCircle className="w-4 h-4 mr-1" />미준수</>
               )}
             </Badge>
           </div>
         </CardHeader>
         <CardContent>
           <div>
             <label className="text-xs font-medium text-gray-500">검사 결과</label>
             <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
               {result.message}
             </div>
           </div>
           {result.lang_attribute && (
             <div className="mt-3">
               <label className="text-xs font-medium text-gray-500">현재 언어 속성</label>
               <div className="mt-1 p-2 bg-gray-50 rounded text-sm font-mono">
                 lang="{result.lang_attribute}"
               </div>
             </div>
           )}
         </CardContent>
       </Card>
     ))}
   </div>
 );
};

// 마크업 오류 방지 상세 컴포넌트
const MarkupErrorDetail = ({ results }: MarkupErrorDetailProps) => {
 return (
   <div className="space-y-4">
     <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-md text-violet-700 font-bold">[ 마크업 오류 방지 ] 수정 가이드</span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ WEBridge는 [마크업 오류 방지] 미준수 여부를 다음 기준으로 확인해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 중복된 속성을 사용한 경우</li>
          <li>• id 속성값을 중복으로 사용한 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 마크업 언어로 작성된 콘텐츠는 해당 마크업 언어의 문법을 최대한 준수하여 제공해야 해요.</li>
          <li>• 요소의 속성도 마크업 문법을 최대한 준수하여 제공해야 해요.</li>
          <li>• 요소의 열고 닫음, 중첩 관계의 오류가 없도록 제공해야 해요.</li>
          <li>• 중복된 속성 사용 금지: 하나의 요소 안에서 속성을 중복하여 선언하지 않아야 해요.</li>
          <li>• id 속성값 중복 선언 금지: 하나의 마크업 문서에서는 같은 id값을 중복하여 선언하지 않아야 해요.</li>
        </ul>
      </div>

     {results.map((result: MarkupErrorResult, index: number) => (
       <Card key={result.id} className="border-l-4 border-l-red-500">
         <CardHeader className="pb-3">
           <div className="flex items-center justify-between">
             <CardTitle className="text-sm font-medium">
               오류 항목 {index + 1}
             </CardTitle>
             <Badge className={result.compliant ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}>
               {result.compliant ? (
                 <><CheckCircle className="w-4 h-4 mr-1" />준수</>
               ) : (
                 <><XCircle className="w-4 h-4 mr-1" />미준수 ({result.total_errors}개 오류)</>
               )}
             </Badge>
           </div>
         </CardHeader>
         <CardContent className="space-y-3">
           <div>
             <label className="text-xs font-medium text-gray-500">검사 결과</label>
             <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
               {result.message}
             </div>
           </div>
           
           {result.total_errors > 0 && (
             <div>
               <label className="text-xs font-medium text-gray-500">총 오류 수</label>
               <div className="mt-1 text-lg font-semibold text-red-600">
                 {result.total_errors}개
               </div>
             </div>
           )}
           
           {result.error_details && result.error_details.length > 0 && (
             <div>
               <label className="text-xs font-medium text-gray-500">오류 상세</label>
               <div className="mt-1 space-y-1">
                 {result.error_details.map((error: string, idx: number) => (
                   <div key={idx} className="p-2 bg-red-50 rounded text-sm text-red-700">
                     {error}
                   </div>
                 ))}
               </div>
             </div>
           )}
         </CardContent>
       </Card>
     ))}
   </div>
 );
};

// 제목 제공 상세 컴포넌트
const HeadingDetail = ({ results }: HeadingDetailProps) => {
 return (
   <div className="space-y-4">
     <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-md text-emerald-700 font-bold">[ 제목 제공 ] 수정 가이드</span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ WEBridge는 [제목 제공] 미준수 여부를 다음 기준으로 확인해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 콘텐츠 블록의 제목 계층 구조가 올바르지 않은 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 콘텐츠 블록의 제목 계층 구조는 순서에 맞게 제공해야 하며, 중간에 누락된 계층이 없어야 해요.</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 제목은 간결하고 명확하게 작성하며, 해당 페이지·프레임·콘텐츠 블록의 내용을 유추할 수 있도록 해야 해요.</li>
          <li>• 웹 페이지는 유일하고 서로 다른 제목(title)을 제공해야 해요.</li>
          <li>• 팝업창에도 제목(title)을 제공해야 해요.</li>
          <li>• 프레임에도 제목(title)을 제공해야 하며, 내용이 없을 경우 '빈 프레임'과 같이 표시해야 해요.</li>
          <li>• 콘텐츠 블록에도 적절한 제목(heading)을 제공하되, 본문이 없는 블록에는 제목을 붙이지 않아야 해요.</li>
          <li>• 제목 작성 시 불필요한 특수 기호를 반복 사용하지 않아야 해요.</li>
        </ul>
      </div>

     {results.map((result: HeadingResult, index: number) => (
       <Card key={result.id} className="border-l-4 border-l-yellow-500">
         <CardHeader className="pb-3">
           <div className="flex items-center justify-between">
             <CardTitle className="text-sm font-medium">
               오류 항목 {index + 1}
             </CardTitle>
             <Badge className={result.compliant ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}>
               {result.compliant ? (
                 <><CheckCircle className="w-4 h-4 mr-1" />준수</>
               ) : (
                 <><XCircle className="w-4 h-4 mr-1" />미준수 ({result.total_issues}개 문제)</>
               )}
             </Badge>
           </div>
         </CardHeader>
         <CardContent className="space-y-4">
           {/* 페이지 제목 영역 */}
           <div className="bg-blue-50 p-3 rounded">
             <h4 className="text-sm font-medium text-blue-800 mb-2">페이지 제목</h4>
             <div className="grid grid-cols-2 gap-4 text-sm">
               <div className="flex items-center gap-2">
                 {result.page_title_exists ? (
                   <CheckCircle className="w-4 h-4 text-green-600" />
                 ) : (
                   <XCircle className="w-4 h-4 text-red-600" />
                 )}
                 <span>제목 존재</span>
               </div>
               <div className="flex items-center gap-2">
                 {!result.page_title_empty ? (
                   <CheckCircle className="w-4 h-4 text-green-600" />
                 ) : (
                   <XCircle className="w-4 h-4 text-red-600" />
                 )}
                 <span>내용 있음</span>
               </div>
             </div>
             {result.page_title_text && (
               <div className="mt-2">
                 <label className="text-xs font-medium text-blue-700">제목 내용</label>
                 <div className="mt-1 p-2 bg-white rounded text-sm">
                   "{result.page_title_text}" ({result.page_title_length}자)
                 </div>
               </div>
             )}
           </div>

           {/* 검사 결과 메시지 */}
           <div>
             <label className="text-xs font-medium text-gray-500">종합 검사 결과</label>
             <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
               {result.message}
             </div>
           </div>

           {/* 문제 상세 내역 */}
           {result.issues_details && result.issues_details.length > 0 && (
             <div>
               <label className="text-xs font-medium text-gray-500">문제 상세 내역</label>
               <div className="mt-1 space-y-1">
                 {result.issues_details.map((issue: string, idx: number) => (
                   <div key={idx} className="p-2 bg-red-50 rounded text-sm text-red-700">
                     {issue}
                   </div>
                 ))}
               </div>
             </div>
           )}
         </CardContent>
       </Card>
     ))}
   </div>
 );
};

// 응답 시간 조절 상세 컴포넌트
const ResponseTimeDetail = ({ results }: ResponseTimeDetailProps) => {
 return (
   <div className="space-y-4">
     <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-md text-pink-700 font-bold">[ 응답 시간 조절 ] 수정 가이드</span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ WEBridge는 [응답 시간 조절] 미준수 여부를 다음 기준으로 확인해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 시간 제한 콘텐츠가 존재하는 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 시간 제한이 있는 콘텐츠는 제공하지 않아야 해요.</li>
          <li>• 반응 시간이 정해진 콘텐츠를 제공해야 하는 경우, 최소 20초 이상의 시간을 부여하고 사전에 반응 시간 조절 방법을 안내해야 해요.</li>
          <li>• 시간 제한을 해제하거나 연장할 수 있는 선택지를 제공하여 사용자가 반응 시간을 조절할 수 있도록 해야 해요.</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 반응 시간 조절이 원천적으로 불가능한 경우(예: 온라인 경매, 실시간 게임)는 본 검사 항목이 적용되지 않아요.</li>
          <li>• 검사 항목에 해당하지 않더라도, 사용자에게 시간 제한이 있다는 사실과 종료 시점을 반드시 알려주어야 해요.</li>
          <li>• 세션 시간이 20시간 이상인 콘텐츠는 예외로 간주돼요.</li>
        </ul>
      </div>

     {results.map((result: ResponseTimeResult, index: number) => (
       <Card key={result.id} className="border-l-4 border-l-cyan-500">
         <CardHeader className="pb-3">
           <div className="flex items-center justify-between">
             <CardTitle className="text-sm font-medium">
               오류 항목 {index + 1}
             </CardTitle>
             <Badge className={result.compliant ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}>
               {result.compliant ? (
                 <><CheckCircle className="w-4 h-4 mr-1" />준수</>
               ) : (
                 <><XCircle className="w-4 h-4 mr-1" />미준수</>
               )}
             </Badge>
           </div>
         </CardHeader>
         <CardContent className="space-y-3">
           <div>
             <label className="text-xs font-medium text-gray-500">검사 결과</label>
             <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
               {result.message}
             </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-medium text-gray-500">시간 제한 여부</label>
               <div className="mt-1 flex items-center gap-2">
                 {result.has_time_limit ? (
                   <XCircle className="w-4 h-4 text-red-600" />
                 ) : (
                   <CheckCircle className="w-4 h-4 text-green-600" />
                 )}
                 <span className="text-sm">
                   {result.has_time_limit ? '시간 제한 있음' : '시간 제한 없음'}
                 </span>
               </div>
             </div>
             
             {result.short_timeouts > 0 && (
               <div>
                 <label className="text-xs font-medium text-gray-500">짧은 시간 제한</label>
                 <div className="mt-1 text-lg font-semibold text-red-600">
                   {result.short_timeouts}개
                 </div>
               </div>
             )}
           </div>
         </CardContent>
       </Card>
     ))}
   </div>
 );
};

// 정지 기능 제공 상세 컴포넌트
const PauseControlDetail = ({ results }: PauseControlDetailProps) => {
 return (
   <div className="space-y-4">
     <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-md text-yellow-700 font-bold">[ 정지 기능 제공 ] 수정 가이드</span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ WEBridge는 [정지 기능 제공] 미준수 여부를 다음 기준으로 확인해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 스크롤 및 자동 갱신되는 콘텐츠를 정지할 수 없는 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 스크롤 및 자동 갱신되는 콘텐츠의 사용을 배제하는 것이 좋아요.</li>
          <li>• 스크롤 및 자동 갱신되는 콘텐츠를 사용할 경우 제어 기능(예: 정지, 앞으로 이동, 뒤로 이동)을 제공해야 해요.</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 제어 기능이 정상적으로 작동하는지 테스트해야 해요.</li>
        </ul>
      </div>

     {results.map((result: PauseControlResult, index: number) => (
       <Card key={result.id} className="border-l-4 border-l-amber-500">
         <CardHeader className="pb-3">
           <div className="flex items-center justify-between">
             <CardTitle className="text-sm font-medium">
               오류 항목 {index + 1}
             </CardTitle>
             <Badge className={result.compliant ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}>
               {result.compliant ? (
                 <><CheckCircle className="w-4 h-4 mr-1" />준수</>
               ) : (
                 <><XCircle className="w-4 h-4 mr-1" />미준수</>
               )}
             </Badge>
           </div>
         </CardHeader>
         <CardContent className="space-y-3">
           <div>
             <label className="text-xs font-medium text-gray-500">검사 결과</label>
             <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
               {result.message}
             </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-medium text-gray-500">자동 콘텐츠 발견</label>
               <div className="mt-1 text-lg font-semibold">
                 {result.auto_elements_found}개
               </div>
             </div>
             
             <div>
               <label className="text-xs font-medium text-gray-500">정지 기능 없음</label>
               <div className="mt-1 text-lg font-semibold text-red-600">
                 {result.elements_without_pause}개
               </div>
             </div>
           </div>
         </CardContent>
       </Card>
     ))}
   </div>
 );
};

// 깜빡임과 번쩍임 사용 제한 상세 컴포넌트
const FlashingDetail = ({ results }: FlashingDetailProps) => {
 return (
   <div className="space-y-4">
     <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-md text-gray-700 font-bold">[ 깜빡임과 번쩍임 사용 제한 ] 수정 가이드</span>
        </div>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ WEBridge는 [깜빡임과 번쩍임 사용 제한] 미준수 여부를 다음 기준으로 확인해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 초당 3~50회의 속도로 번쩍이는 콘텐츠가 있는 경우</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">ℹ️ 오류 항목을 수정하기 위해 아래 내용을 준수해야 해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 초당 3~50회로 깜빡이는 콘텐츠는 깜빡임을 정지할 수 있는 기능을 제공해야 해요.</li>
          <li>• 번쩍임이 초당 3~50회일 경우, 10인치 이상 화면에서 해당 콘텐츠가 차지하는 면적 합은 화면 전체의 10%를 넘지 않아야 해요.</li>
          <li>• 콘텐츠의 번쩍임 지속 시간은 3초 미만으로 제한해야 해요.</li>
        </ul>
        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-sm font-bold">💡 WEBridge 검사 이외에 이런 점도 고려해야 해요.</span>
        </div>
        <ul className="text-sm space-y-1">
          <li>• 10인치 이상 화면을 사용하는 기기(예: 태블릿, PC 모니터, 무인 안내기 등)에서는 광과민성 발작 유발 가능성에 특히 주의해야 해요.</li>
        </ul>
      </div>

     {results.map((result: FlashingResult, index: number) => (
       <Card key={result.id} className="border-l-4 border-l-rose-500">
         <CardHeader className="pb-3">
           <div className="flex items-center justify-between">
             <CardTitle className="text-sm font-medium">
               오류 항목 {index + 1}
             </CardTitle>
             <Badge className={result.compliant ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}>
               {result.compliant ? (
                 <><CheckCircle className="w-4 h-4 mr-1" />준수</>
               ) : (
                 <><XCircle className="w-4 h-4 mr-1" />미준수</>
               )}
             </Badge>
           </div>
         </CardHeader>
         <CardContent className="space-y-3">
           <div>
             <label className="text-xs font-medium text-gray-500">검사 결과</label>
             <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
               {result.message}
             </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-medium text-gray-500">깜빡임 요소</label>
               <div className="mt-1 text-lg font-semibold">
                 {result.flashing_elements_count}개
               </div>
             </div>
             
             <div>
               <label className="text-xs font-medium text-gray-500">깜빡임 스크립트</label>
               <div className="mt-1 flex items-center gap-2">
                 {result.has_flashing_script ? (
                   <XCircle className="w-4 h-4 text-red-600" />
                 ) : (
                   <CheckCircle className="w-4 h-4 text-green-600" />
                 )}
                 <span className="text-sm">
                   {result.has_flashing_script ? '발견됨' : '없음'}
                 </span>
               </div>
             </div>
           </div>
           
           {result.issue_details && result.issue_details.length > 0 && (
             <div>
               <label className="text-xs font-medium text-gray-500">문제 상세</label>
               <div className="mt-1 space-y-1">
                 {result.issue_details.map((issue: string, idx: number) => (
                   <div key={idx} className="p-2 bg-rose-50 rounded text-sm text-rose-700">
                     {issue}
                   </div>
                 ))}
               </div>
             </div>
           )}
         </CardContent>
       </Card>
     ))}
   </div>
 );
};

// 카테고리 정보 매핑
const getCategoryInfo = (category: string): CategoryInfo => {
 const categoryMap: Record<string, CategoryInfo> = {
   'alt_text': {
     title: '적절한 대체 텍스트 제공',
     component: AltTextDetail as React.ComponentType<any>
   },
   'contrast': {
     title: '텍스트 콘텐츠의 명도 대비',
     component: ContrastDetail as React.ComponentType<any>
   },
   'keyboard': {
     title: '키보드 사용 보장',
     component: KeyboardDetail as React.ComponentType<any>
   },
   'label': {
     title: '레이블 제공',
     component: LabelDetail as React.ComponentType<any>
   },
   'table': {
     title: '표의 구성',
     component: TableDetail as React.ComponentType<any>
   },
   'video': {
     title: '자막 제공',
     component: VideoDetail as React.ComponentType<any>
   },
   'basic_language': {
     title: '기본 언어 표시',
     component: BasicLanguageDetail as React.ComponentType<any>
   },
   'markup_error': {
     title: '마크업 오류 방지',
     component: MarkupErrorDetail as React.ComponentType<any>
   },
   'heading': {
     title: '제목 제공',
     component: HeadingDetail as React.ComponentType<any>
   },
   'response_time': {
     title: '응답 시간 조절',
     component: ResponseTimeDetail as React.ComponentType<any>
   },
   'pause_control': {
     title: '정지 기능 제공',
     component: PauseControlDetail as React.ComponentType<any>
   },
   'flashing': {
     title: '깜빡임과 번쩍임 사용 제한',
     component: FlashingDetail as React.ComponentType<any>
   }
 };

 return categoryMap[category] || {
   title: '알 수 없는 검사 항목',
   component: () => <div>지원하지 않는 검사 항목입니다.</div>
 };
};

// 메인 상세 페이지 컴포넌트
const AccessibilityScanDetailPage = () => {
 const { scanId, category } = useParams<{ scanId: string; category: string }>();
 const navigate = useNavigate();

 const {
   data: scanDetail,
   isLoading,
   error
 } = useGetScanDetailQuery(scanId!, {
   skip: !scanId
 });

 if (isLoading) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="text-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
         <p className="mt-4 text-gray-600">검사 결과를 불러오는 중...</p>
       </div>
     </div>
   );
 }

 if (error || !scanDetail) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="text-center">
         <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
         <p className="text-gray-600">검사 결과를 불러올 수 없습니다.</p>
         <Button onClick={() => navigate('/dashboard')} className="mt-4">
           대시보드로 돌아가기
         </Button>
       </div>
     </div>
   );
 }

 // 유효하지 않은 카테고리인 경우 대시보드로 리다이렉트
 const categoryInfo = getCategoryInfo(category || '');
 const resultsKey = `${category}_results` as keyof AccessibilityScanDetail;
 
 if (!categoryInfo || !category || !(resultsKey in scanDetail)) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="text-center">
         <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
         <p className="text-gray-600">해당 검사 항목을 찾을 수 없습니다.</p>
         <Button onClick={() => navigate('/dashboard')} className="mt-4">
           대시보드로 돌아가기
         </Button>
       </div>
     </div>
   );
 }

 const results = (scanDetail[resultsKey] as any[]) || [];
 const DetailComponent = categoryInfo.component;

 // 이슈가 있는 결과만 필터링 (문제가 있는 것만 표시)
 const issueResults = results.filter((result: any) => {
   switch (category) {
     case 'alt_text':
       return result.compliance !== 0;
     case 'contrast':
       return !result.wcag_compliant;
     case 'keyboard':
       return !result.accessible;
     case 'label':
       return !result.label_present;
     case 'table':
       return !result.compliant;
     case 'video':
       return !result.has_transcript || !result.autoplay_disabled || !result.has_aria_label;
     default:
       return !result.compliant;
   }
 });

 return (
   <div className="min-h-screen bg-gray-50">
     {/* 헤더 */}
     <div className="bg-white border-b shadow-sm">
       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex items-center justify-between h-16">
           <div className="flex items-center">
             <Button
               variant="ghost"
               size="sm"
               onClick={() => navigate('/dashboard')}
               className="mr-4"
             >
               <ArrowLeft className="w-4 h-4 mr-2" />
               요약 보고서로 돌아가기
             </Button>
           </div>
           
           <div className="flex items-center gap-4">
             <Button
               onClick={() => window.open(scanDetail.url, '_blank')}
               variant="outline"
               size="sm"
             >
               <ExternalLink className="w-4 h-4 mr-2" />
               사이트 보기
             </Button>
           </div>
         </div>
       </div>
     </div>

     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       {/* 검사 항목 설명 */}
       <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
         <h2 className="text-lg font-semibold text-gray-900 mb-2">
           {categoryInfo.title}
         </h2>
         <div className="flex items-center gap-4 text-sm">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-red-500 rounded-full"></div>
             <span>문제 발견: {issueResults.length}개</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-green-500 rounded-full"></div>
             <span>정상: {results.length - issueResults.length}개</span>
           </div>
           <div className="text-gray-500">
             총 검사 대상: {results.length}개
           </div>
         </div>
       </div>

       {/* 검사 결과 상세 */}
       <div className="bg-white rounded-lg shadow-sm border">
         <div className="p-6 border-b">
           <h3 className="text-lg font-semibold text-gray-900">
             문제가 발견된 항목들
           </h3>
           <p className="text-sm text-gray-500 mt-1">
             아래 항목들을 수정하여 웹 접근성을 개선하세요.
           </p>
         </div>
         <div className="p-6">
           {issueResults.length > 0 ? (
             <DetailComponent results={issueResults} scanUrl={scanDetail.url} />
           ) : (
             <div className="text-center py-12">
               <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
               <h3 className="text-lg font-semibold text-gray-900 mb-2">
                 문제가 발견되지 않았습니다!
               </h3>
               <p className="text-gray-600">
                 {categoryInfo.title} 항목은 모든 요소가 접근성 기준을 준수하고 있습니다.
               </p>
               <Button 
                 onClick={() => navigate('/dashboard')} 
                 className="mt-4"
               >
                 대시보드로 돌아가기
               </Button>
             </div>
           )}
         </div>
       </div>
     </div>
   </div>
 );
};

export default AccessibilityScanDetailPage;