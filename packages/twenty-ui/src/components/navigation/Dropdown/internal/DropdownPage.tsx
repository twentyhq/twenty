import { useRef } from 'react';

import styles from '../Dropdown.module.scss';
import { type DropdownPageProps } from '../types/DropdownPageProps';
import { DropdownContext } from './DropdownContext';
import { DropdownPageRegistrationEffect } from './DropdownPageRegistrationEffect';
import { useDropdownContext } from './useDropdownContext';

export const DropdownPage = ({ id, type, children }: DropdownPageProps) => {
  const context = useDropdownContext();
  const pageType = type ?? context.rootType;
  const pageRef = useRef<HTMLDivElement>(null);

  if (context.pageId !== id) {
    return null;
  }

  return (
    <DropdownContext.Provider value={{ ...context, type: pageType }}>
      <div ref={pageRef} className={styles.page}>
        {children}
      </div>
      <DropdownPageRegistrationEffect
        pageRef={pageRef}
        id={id}
        type={pageType}
      />
    </DropdownContext.Provider>
  );
};
