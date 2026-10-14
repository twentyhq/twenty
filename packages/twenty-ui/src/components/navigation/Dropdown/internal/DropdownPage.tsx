import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useCallback, useRef } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Dropdown.module.scss';
import { type DropdownPageProps } from '../types/DropdownPageProps';
import { DropdownContext } from './DropdownContext';
import { DropdownPageRegistrationEffect } from './DropdownPageRegistrationEffect';
import { useDropdownContext } from './useDropdownContext';

export const DropdownPage = ({ id, type, children }: DropdownPageProps) => {
  const context = useDropdownContext();
  const { registerPage } = context;
  const pageType = type ?? context.rootType;
  const pageRef = useRef<HTMLDivElement>(null);
  const registerPageType = useCallback(
    (element: HTMLDivElement | null) => {
      if (isDefined(element)) {
        registerPage({ id, type });
      }
    },
    [id, type, registerPage],
  );
  const mergedRef = useMergedRefs(registerPageType, pageRef);

  if (context.pageId !== id) {
    return null;
  }

  return (
    <DropdownContext.Provider value={{ ...context, type: pageType }}>
      <div ref={mergedRef} className={styles.page}>
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
