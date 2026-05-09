import type { MessageDescriptor } from '@lingui/core';
import type { ReactNode } from 'react';

export type ProblemPointType = {
  heading: ReactNode;
  body: MessageDescriptor;
};
