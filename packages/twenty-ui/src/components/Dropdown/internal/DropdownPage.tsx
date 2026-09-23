import { useLayoutEffect } from 'react';

import { type DropdownPageProps } from '../types/DropdownPageProps';
import { DropdownContext } from './DropdownContext';
import { useDropdownContext } from './useDropdownContext';

export const DropdownPage = ({ id, type, children }: DropdownPageProps) => {
  const context = useDropdownContext();
  const { registerPage } = context;

  useLayoutEffect(() => {
    registerPage({ id, type });
  }, [id, type, registerPage]);

  if (context.pageId !== id) {
    return null;
  }

  return (
    <DropdownContext.Provider
      value={{ ...context, type: type ?? context.type }}
    >
      {children}
    </DropdownContext.Provider>
  );
};
