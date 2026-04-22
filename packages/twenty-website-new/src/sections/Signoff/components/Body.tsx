import { styled } from '@linaria/react';

import { Body as BaseBody } from '@/design-system/components';
import type { BodyType } from '@/design-system/components/Body/types/Body';
import type { Pages } from '@/enums/pages';
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
  body: BodyType;
  page?: Pages;
};

export function Body({ body, page }: BodyProps) {
  return (
    <Subline data-page={page}>
      <BaseBody as="p" body={body} size="sm" weight="regular" />
    </Subline>
  );
}
