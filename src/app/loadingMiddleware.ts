import type { Middleware } from '@reduxjs/toolkit';
import { start, stop } from '@/features/store/loadingSlice';
import { publicApi, privateApi } from '@/app/api';

const isFromRtkQuery = (type: string) =>
  type.startsWith(`${publicApi.reducerPath}/`) || type.startsWith(`${privateApi.reducerPath}/`);

// 백그라운드에서 주기적/자동으로 조회되는 엔드포인트는 전역 로딩 오버레이에서 제외
const EXCLUDED_ENDPOINTS = ['getSurveyTrigger', 'markSurveyShown'];

const isExcludedEndpoint = (type: string) =>
  EXCLUDED_ENDPOINTS.some((endpoint) => type.includes(`/${endpoint}/`));

function getActionType(a: unknown): string | null {
  if (typeof a === 'object' && a !== null && 'type' in a) {
    const t = (a as any).type;
    if (typeof t === 'string') return t;
  }
  return null;
}

export const loadingMiddleware: Middleware = (store) => (next) => (action) => {
  const type = getActionType(action);
  if (type) {
    if (isFromRtkQuery(type) && !isExcludedEndpoint(type) && type.endsWith('/pending')) {
      store.dispatch(start());
    }
    if (
      isFromRtkQuery(type) &&
      !isExcludedEndpoint(type) &&
      (type.endsWith('/fulfilled') || type.endsWith('/rejected'))
    ) {
      store.dispatch(stop());
    }
  }
  return next(action);
};
