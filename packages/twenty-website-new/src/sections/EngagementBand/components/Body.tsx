import { Body as BaseBody } from '@/design-system/components';
import type { MessageBody } from '@/lib/i18n/message-body';
import { renderMessageDescriptor } from '@/lib/i18n/render-message-descriptor';
import { styled } from '@linaria/react';

const StyledBody = styled(BaseBody)`
  --body-sm-color: color-mix(in srgb, currentColor 90%, transparent);
  max-width: 668px;
`;

type BodyProps = {
  body: MessageBody;
};

export function Body({ body }: BodyProps) {
  return (
    <StyledBody
      body={body}
      renderText={renderMessageDescriptor}
      size="sm"
      weight="regular"
    />
  );
}
