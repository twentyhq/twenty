import { useLayoutEffect } from 'react';

import { type DropdownPageProps } from '../types/DropdownPageProps';
import { DropdownContext } from './DropdownContext';
import { useDropdownContext } from './useDropdownContext';

export const DropdownPage = ({ id, kind, children }: DropdownPageProps) => {
  const context = useDropdownContext();
  const { registerPage } = context;

  useLayoutEffect(() => {
    registerPage({ id, kind });
  }, [id, kind, registerPage]);

  if (context.pageId !== id) {
    return null;
  }

  return (
    <DropdownContext.Provider
      value={{ ...context, kind: kind ?? context.kind }}
    >
      {children}
    </DropdownContext.Provider>
  );
};
