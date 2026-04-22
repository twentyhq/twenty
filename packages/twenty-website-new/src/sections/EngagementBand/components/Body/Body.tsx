import { Body as BaseBody } from '@/design-system/components';
import type { BodyType } from '@/design-system/components/Body/types/Body';
import { styled } from '@linaria/react';

const StyledBody = styled(BaseBody)`
  --body-sm-color: color-mix(in srgb, currentColor 90%, transparent);
  max-width: 668px;
`;

type BodyProps = {
  body: BodyType;
};

export function Body({ body }: BodyProps) {
  return <StyledBody body={body} size="sm" weight="regular" />;
}
