import { Body as BaseBody } from '@/design-system/components';
import type { MessageBody } from '@/lib/i18n/message-body';
import type { MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const StyledBody = styled(BaseBody)`
  --body-sm-color: color-mix(in srgb, currentColor 90%, transparent);
  max-width: 668px;
`;

type BodyProps = {
  body: MessageBody;
  renderText: (descriptor: MessageDescriptor) => ReactNode;
};

export function Body({ body, renderText }: BodyProps) {
  return (
    <StyledBody
      body={body}
      renderText={renderText}
      size="sm"
      weight="regular"
    />
  );
}
