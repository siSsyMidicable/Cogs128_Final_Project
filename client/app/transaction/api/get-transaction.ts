/**
 * Dev stub for useTransaction
 */
import { useState } from 'react';

export function useTransaction(id?: string) {
  const [data] = useState<any>(null);
  return { data, isLoading: false };
}

export default useTransaction;
