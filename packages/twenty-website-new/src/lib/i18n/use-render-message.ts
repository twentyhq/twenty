'use client';

import type { MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react';
import { useCallback } from 'react';

export const useRenderMessage = () => {
  const { i18n } = useLingui();
  return useCallback(
    (descriptor: MessageDescriptor) => i18n._(descriptor),
    [i18n],
  );
};
