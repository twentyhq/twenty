'use client';

import { useContext } from 'react';

import { ContactCalModalContext } from './contact-cal-modal-context';
import { doNotTranslate } from 'twenty-shared/utils';

export function useContactCalModal() {
  const value = useContext(ContactCalModalContext);
  if (value === null) {
    throw new Error(
      doNotTranslate(
        'useContactCalModal must be used within ContactCalModalRoot',
      ),
    );
  }
  return value;
}
