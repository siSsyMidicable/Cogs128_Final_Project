import { z } from 'zod';
import { useCallback, useState } from 'react';

export const createTransactionInputSchema = z.object({
  // Add other fields as needed
  amount: z.number().optional(),
  description: z.string().optional(),
});

export function useCreateTransaction() {
  const [isPending, setIsPending] = useState(false);
  const mutate = useCallback(async (values: any) => {
    setIsPending(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      return { ok: true, data: values };
    } finally {
      setIsPending(false);
    }
  }, []);
  return { mutate, isPending };
}

export default useCreateTransaction;
