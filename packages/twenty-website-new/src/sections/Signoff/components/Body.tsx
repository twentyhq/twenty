import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

import { Body as BaseBody } from '@/design-system/components';
import type { BodyType } from '@/design-system/components/Body';
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

type BodyProps<TText = ReactNode> = {
  body: BodyType<TText>;
  page?: Page;
  renderText?: (text: TText) => ReactNode;
};

export function Body<TText = ReactNode>({
  body,
  page,
  renderText,
}: BodyProps<TText>) {
  return (
    <Subline data-page={page}>
      {renderText === undefined ? (
        <BaseBody
          as="p"
          body={body as BodyType<ReactNode>}
          size="sm"
          weight="regular"
        />
      ) : (
        <BaseBody<TText>
          as="p"
          body={body}
          renderText={renderText}
          size="sm"
          weight="regular"
        />
      )}
    </Subline>
  );
}
