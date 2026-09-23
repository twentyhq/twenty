import { useCallback } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Dropdown.module.scss';
import { type DropdownPageProps } from '../types/DropdownPageProps';
import { DropdownContext } from './DropdownContext';
import { useDropdownContext } from './useDropdownContext';

export const DropdownPage = ({ id, type, children }: DropdownPageProps) => {
  const context = useDropdownContext();
  const { registerPage } = context;
  const registerPageType = useCallback(
    (element: HTMLDivElement | null) => {
      if (isDefined(element)) {
        registerPage({ id, type });
      }
    },
    [id, type, registerPage],
  );

  if (context.pageId !== id) {
    return null;
  }

  return (
    <DropdownContext.Provider
      value={{ ...context, type: type ?? context.rootType }}
    >
      <div
        ref={registerPageType}
        className={styles.page}
        data-dropdown-page-type={type ?? context.rootType}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
};
