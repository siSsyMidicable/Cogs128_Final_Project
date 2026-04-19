import { z } from 'zod';
import { useCallback, useEffect, useState } from 'react';

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginValues = {
  email: string;
  password: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

let currentUser: User | null = null;
const userListeners = new Set<(user: User | null) => void>();

function publishUser(user: User | null) {
  currentUser = user;
  userListeners.forEach((listener) => listener(user));
}

export function useLogin() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (values: LoginValues) => {
    setIsPending(true);

    loginInputSchema.parse(values);

    await new Promise((r) => setTimeout(r, 300));

    publishUser({
      id: values.email,
      name: values.email.split('@')[0] || 'User',
      email: values.email,
    });

    setIsPending(false);
    return { ok: true };
  }, []);

  return { mutate, isPending };
}

export function useRegister() {
  return useLogin();
}

export function useUser() {
  const [user, setUser] = useState<User | null>(currentUser);

  useEffect(() => {
    userListeners.add(setUser);
    return () => userListeners.delete(setUser);
  }, []);

  return { user, data: user, isLoading: false };
}

export function useLogout() {
  return {
    isPending: false,
    mutate: async () => {
      publishUser(null);
    },
  };
}
