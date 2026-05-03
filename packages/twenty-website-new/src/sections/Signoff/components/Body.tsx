import { styled } from '@linaria/react';

import { Body as BaseBody } from '@/design-system/components';
import type { MessageBody } from '@/lib/i18n/message-body';
import { renderMessageDescriptor } from '@/lib/i18n/render-message-descriptor';
import type { Page } from '@/lib/pages';
import { theme } from '@/theme';

const Subline = styled.div`
  --body-sm-color: currentColor;
  color: color-mix(in srgb, currentColor 80%, transparent);
  margin-bottom: ${theme.spacing(6)};
  max-width: 452px;
  min-width: 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-page='partners'] {
      white-space: pre-line;
    }
  }
`;

type BodyProps = {
  body: MessageBody;
  page?: Page;
};

export function Body({ body, page }: BodyProps) {
  return (
    <Subline data-page={page}>
      <BaseBody
        as="p"
        body={body}
        renderText={renderMessageDescriptor}
        size="sm"
        weight="regular"
      />
    </Subline>
  );
}
