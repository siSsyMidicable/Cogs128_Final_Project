import { useState } from 'react';

export function useService(id?: string) {
  const [data] = useState({ id, name: 'Sample Service' });
  return { data, isLoading: false };
}
