import { useState, useCallback } from 'react';

export function useUpdateTransaction() {
  const [isPending, setIsPending] = useState(false);
  const mutate = useCallback(async () => {
    setIsPending(true);
    await new Promise(r => setTimeout(r, 300));
    setIsPending(false);
    return { ok: true };
  }, []);
  return { mutate, isPending };
}
