import { z } from 'zod';
import { useState, useCallback } from 'react';
export const createTransactionInputSchema = z.object({ amount: z.number().optional(), description: z.string().optional() });
export function useCreateTransaction() {
  const [isPending, setIsPending] = useState(false);
  const mutate = useCallback(async (values: any) => {
    setIsPending(true);
    await new Promise(r => setTimeout(r, 300));
    setIsPending(false);
    return { ok: true };
  }, []);
  return { mutate, isPending };
}
