'use client';

import type { MessageDescriptor } from '@lingui/core';
import { Trans } from '@lingui/react';

type MessageDescriptorTransProps = {
  descriptor: MessageDescriptor;
};

export const MessageDescriptorTrans = ({
  descriptor,
}: MessageDescriptorTransProps) => (
  <Trans
    id={descriptor.id}
    message={descriptor.message}
    values={descriptor.values}
    comment={descriptor.comment}
  />
);
