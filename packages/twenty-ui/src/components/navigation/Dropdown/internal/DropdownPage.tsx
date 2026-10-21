import { useCallback, useState } from 'react';

import styles from '../Dropdown.module.scss';
import { type DropdownPageProps } from '../types/DropdownPageProps';
import { DropdownContext } from './DropdownContext';
import { DropdownPageEffect } from './DropdownPageEffect';
import { useDropdownContext } from './useDropdownContext';

export const DropdownPage = ({ id, type, children }: DropdownPageProps) => {
  const context = useDropdownContext();
  const { registerTitle: registerContextTitle } = context;
  const [visitedId, setVisitedId] = useState<string>();
  const isActive = context.isPageActive && context.pageId === id;
  const shouldVisit = isActive && context.open;
  const registerTitle = useCallback(
    (titleId: string) => {
      if (!isActive) {
        return () => undefined;
      }

      return registerContextTitle(titleId);
    },
    [isActive, registerContextTitle],
  );

  if (shouldVisit && visitedId !== id) {
    setVisitedId(id);
  }

  if (visitedId !== id && !shouldVisit) {
    return null;
  }

  return (
    <DropdownContext.Provider
      value={{
        ...context,
        type: type ?? context.rootType,
        isPageActive: isActive,
        registerTitle,
      }}
    >
      <div
        hidden={!isActive}
        inert={!isActive}
        className={styles.page}
        data-dropdown-page-type={type ?? context.rootType}
      >
        {children}
      </div>
      <DropdownPageEffect id={id} type={type} isActive={isActive} />
    </DropdownContext.Provider>
  );
};
