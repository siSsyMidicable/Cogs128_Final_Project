import { z } from 'zod';
import { useState, useCallback } from 'react';

export const updateProfileInputSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export function useUpdateProfile() {
  const [isPending, setIsPending] = useState(false);
  const mutate = useCallback(async (values: any) => {
    setIsPending(true);
    await new Promise(r => setTimeout(r, 300));
    setIsPending(false);
    return { ok: true, data: values };
  }, []);
  return { mutate, isPending };
}
