import { z } from 'zod';
import { useState, useCallback } from 'react';

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
});

export function useLogin() {
  const [isPending, setIsPending] = useState(false);
  const mutate = useCallback(async () => {
    setIsPending(true);
    await new Promise(r => setTimeout(r, 300));
    setIsPending(false);
    return { ok: true };
  }, []);
  return { mutate, isPending };
}

export function useRegister() {
  return useLogin();
}

export function useUser() {
  return { user: null, isLoading: false };
}

export function useLogout() {
  return { mutate: async () => {} };
}
