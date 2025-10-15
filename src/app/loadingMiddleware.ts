import type { Middleware } from "@reduxjs/toolkit";
import { start, stop } from "@/features/store/loadingSlice";
import { publicApi, privateApi } from "@/app/api";

const isFromRtkQuery = (type: string) =>
  type.startsWith(`${publicApi.reducerPath}/`) ||
  type.startsWith(`${privateApi.reducerPath}/`);

function getActionType(a: unknown): string | null {
  if (typeof a === "object" && a !== null && "type" in a) {
    const t = (a as any).type;
    if (typeof t === "string") return t;
  }
  return null;
}

export const loadingMiddleware: Middleware = (store) => (next) => (action) => {
  const type = getActionType(action);
  if (type) {
    if (isFromRtkQuery(type) && type.endsWith("/pending")) {
      store.dispatch(start());
    }
    if (
      isFromRtkQuery(type) &&
      (type.endsWith("/fulfilled") || type.endsWith("/rejected"))
    ) {
      store.dispatch(stop());
    }
  }
  return next(action);
};
