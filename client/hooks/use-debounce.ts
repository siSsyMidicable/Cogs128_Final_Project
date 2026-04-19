import { useRef } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(fn: T, delay = 300) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  return (...args: Parameters<T>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fn(...args), delay);
  };
}
