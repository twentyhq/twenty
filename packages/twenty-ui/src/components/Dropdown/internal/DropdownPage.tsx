import { useCallback } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Dropdown.module.scss';
import { type DropdownPageProps } from '../types/DropdownPageProps';
import { DropdownContext } from './DropdownContext';
import { useDropdownContext } from './useDropdownContext';

export const DropdownPage = ({ id, type, children }: DropdownPageProps) => {
  const context = useDropdownContext();
  const { onPageMount } = context;
  const handleMount = useCallback(
    (element: HTMLDivElement | null) => {
      if (isDefined(element)) {
        onPageMount({ id, type, element });
      }
    },
    [id, type, onPageMount],
  );

  if (context.pageId !== id) {
    return null;
  }

  return (
    <DropdownContext.Provider
      value={{ ...context, type: type ?? context.rootType }}
    >
      <div ref={handleMount} className={styles.page}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};
