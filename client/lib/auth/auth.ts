import { z } from 'zod';
import { useCallback, useEffect, useState } from 'react';
import { YOU } from '@/lib/matching/data';
import type { MatchUser } from '@/lib/matching/matching';

// Permissive email regex — allows special chars like $ in local part (e.g. si$sy@demo.com)
const permissiveEmail = z.string().regex(
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  'Please enter a valid email address',
);

export const loginInputSchema = z.object({
  email: permissiveEmail,
  password: z.string().min(1),
});

export const registerInputSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: permissiveEmail,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type LoginValues  = { email: string; password: string };
type RegisterValues = { name: string; email: string; password: string; confirmPassword: string };

export type User = MatchUser;

let currentUser: User | null = null;
const userListeners = new Set<(user: User | null) => void>();

function publishUser(user: User | null) {
  currentUser = user;
  userListeners.forEach((listener) => listener(user));
}

// ── Resolve API base from tunnel env or local fallback ───────────────────────
const API_BASE: string = (() => {
  try {
    const tunnel = (process.env as Record<string,string | undefined>).EXPO_PUBLIC_TUNNEL_URL ||
                   (process.env as Record<string,string | undefined>).TUNNEL_URL;
    if (tunnel) return tunnel.replace(/\/$/, '');
  } catch { /* ignore */ }
  return 'http://localhost:3000';
})();

// Demo credentials — bypass network entirely
const DEMO_EMAIL    = 'si$sy@demo.com';
const DEMO_PASSWORD = 'password';

// ── useLogin ─────────────────────────────────────────────────────────────────
export function useLogin() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (values: LoginValues) => {
    setIsPending(true);
    try {
      loginInputSchema.parse(values);

      // ── Demo short-circuit: always succeeds, no network needed ──────────
      if (
        values.email.toLowerCase() === DEMO_EMAIL.toLowerCase() &&
        values.password === DEMO_PASSWORD
      ) {
        await new Promise((r) => setTimeout(r, 280)); // tiny fake delay
        publishUser({ ...YOU, id: DEMO_EMAIL, name: 'Sissy', email: DEMO_EMAIL });
        return { ok: true };
      }

      // Try real Neon API first
      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: values.email, password: values.password }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { message?: string }).message || `Login failed (${res.status})`);
        }
        const data = await res.json() as { user?: { id: string; name: string; email: string } };
        publishUser({
          ...YOU,
          id:    data.user?.id    ?? values.email,
          name:  data.user?.name  ?? values.email.split('@')[0] ?? 'User',
          email: data.user?.email ?? values.email,
        });
        return { ok: true };
      } catch (networkErr) {
        if (networkErr instanceof TypeError) {
          await new Promise((r) => setTimeout(r, 300));
          publishUser({
            ...YOU,
            id: values.email,
            name: values.email.split('@')[0] || 'User',
            email: values.email,
          });
          return { ok: true };
        }
        throw networkErr;
      }
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

// ── useRegister ───────────────────────────────────────────────────────────────
export function useRegister() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (values: RegisterValues) => {
    setIsPending(true);
    try {
      registerInputSchema.parse(values);

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     values.name,
          email:    values.email,
          password: values.password,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message || `Registration failed (${res.status})`);
      }

      const data = await res.json() as { user?: { id: string; name: string; email: string } };
      publishUser({
        ...YOU,
        id:    data.user?.id    ?? values.email,
        name:  data.user?.name  ?? values.name,
        email: data.user?.email ?? values.email,
      });
      return { ok: true };
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

// ── useUser ───────────────────────────────────────────────────────────────────
export function useUser() {
  const [user, setUser] = useState<User | null>(currentUser);

  useEffect(() => {
    userListeners.add(setUser);
    return () => userListeners.delete(setUser);
  }, []);

  return { user, data: user, isLoading: false };
}

// ── useLogout ─────────────────────────────────────────────────────────────────
export function useLogout() {
  return {
    isPending: false,
    mutate: async () => { publishUser(null); },
  };
}
