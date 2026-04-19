import { useState } from 'react';

export function useInfiniteTransactions() {
  const [data] = useState([]);
  return { data, fetchNextPage: () => {}, hasNextPage: false, isFetching: false };
}
