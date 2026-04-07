import { styled } from '@linaria/react';

import { Body as BaseBody } from '@/design-system/components';
import type { BodyType } from '@/design-system/components/Body/types/Body';
import { theme } from '@/theme';

const Subline = styled.div`
  color: color-mix(in srgb, currentColor 80%, transparent);
  margin-bottom: ${theme.spacing(6)};
  max-width: 452px;
  min-width: 0;
  width: 100%;
`;

type BodyProps = {
  body: BodyType;
};

export function Body({ body }: BodyProps) {
  return (
    <Subline>
      <BaseBody as="p" body={body} size="sm" weight="regular" />
    </Subline>
  );
}
