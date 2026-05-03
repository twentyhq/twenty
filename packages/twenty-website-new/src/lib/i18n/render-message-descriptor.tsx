import type { MessageDescriptor } from '@lingui/core';
import type { ReactNode } from 'react';
import { MessageDescriptorTrans } from './MessageDescriptorTrans';

export const renderMessageDescriptor = (
  descriptor: MessageDescriptor,
): ReactNode => <MessageDescriptorTrans descriptor={descriptor} />;
