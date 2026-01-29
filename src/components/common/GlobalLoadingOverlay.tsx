import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';

const API_DELAY_MS = 120;
const API_MIN_SHOW_MS = 600;
const ROUTE_MIN_SHOW_MS = 500;
const ROUTE_DELAY_MS = 0;

const API_IDLE_HIDE_DELAY_MS = 350;

export function GlobalLoadingOverlay() {
  const { count, routeActive } = useSelector((s: RootState) => s.loading);
  const apiActive = count > 0;

  type Mode = 'route' | 'api' | 'none';
  const mode: Mode = routeActive ? 'route' : apiActive ? 'api' : 'none';
  const active = mode !== 'none';

  const [visible, setVisible] = useState(false);

  // 추가: 최신 visible 값 추적 (stale 방지)
  const visibleRef = useRef(false);
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  const startedAtRef = useRef<number | null>(null);
  const onTimerRef = useRef<number | null>(null);
  const offTimerRef = useRef<number | null>(null);

  const clearOnTimer = () => {
    if (onTimerRef.current != null) {
      clearTimeout(onTimerRef.current);
      onTimerRef.current = null;
    }
  };

  const clearOffTimer = () => {
    if (offTimerRef.current != null) {
      clearTimeout(offTimerRef.current);
      offTimerRef.current = null;
    }
  };

  useEffect(() => {
    const delay = mode === 'route' ? ROUTE_DELAY_MS : API_DELAY_MS;
    const minShow = mode === 'route' ? ROUTE_MIN_SHOW_MS : API_MIN_SHOW_MS;

    const turnOn = () => {
      clearOffTimer();

      // 최신값 기준
      if (visibleRef.current) return;
      if (onTimerRef.current != null) return;

      onTimerRef.current = window.setTimeout(() => {
        onTimerRef.current = null;
        startedAtRef.current = Date.now();
        setVisible(true);
      }, delay) as unknown as number;
    };

    const turnOff = () => {
      clearOnTimer();
      if (offTimerRef.current != null) return;

      const doHide = () => {
        const hideNow = () => {
          startedAtRef.current = null;
          setVisible(false);
        };

        if (startedAtRef.current == null) {
          hideNow();
          return;
        }

        const elapsed = Date.now() - startedAtRef.current;
        const remain = Math.max(0, minShow - elapsed);

        offTimerRef.current = window.setTimeout(() => {
          offTimerRef.current = null;
          hideNow();
        }, remain) as unknown as number;
      };

      if (mode === 'api') {
        offTimerRef.current = window.setTimeout(() => {
          offTimerRef.current = null;
          doHide();
        }, API_IDLE_HIDE_DELAY_MS) as unknown as number;
      } else {
        doHide();
      }
    };

    if (active) turnOn();
    else turnOff();

    return () => {
      clearOnTimer();
      clearOffTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, mode]);

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-opacity duration-300
      ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      ${visible ? '' : 'invisible'}`}
      aria-hidden={!visible}
      aria-busy={visible}
      aria-live='polite'
    >
      <div className='absolute inset-0 bg-white/95' />
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='flex items-center gap-3 px-5 py-3 shadow-lg rounded-2xl bg-white/90'>
          <svg className='w-5 h-5 animate-spin' viewBox='0 0 24 24'>
            <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' opacity='0.25' />
            <path d='M22 12a10 10 0 0 1-10 10' fill='none' stroke='currentColor' strokeWidth='4' />
          </svg>
          <span className='text-sm font-medium text-gray-700'>로딩 중…</span>
        </div>
      </div>
    </div>
  );
}
