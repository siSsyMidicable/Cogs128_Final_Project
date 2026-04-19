import { useCallback, useState } from 'react';

export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);
  const onToggle = useCallback(() => setIsOpen((v) => !v), []);

  // `toggle` alias keeps compatibility with existing callers.
  const toggle = onToggle;

  return { isOpen, onOpen, onClose, onToggle, toggle };
}
