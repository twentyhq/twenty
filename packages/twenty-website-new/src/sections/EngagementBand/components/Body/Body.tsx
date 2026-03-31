import { Body as BaseBody } from '@/design-system/components';
import type { BodyType } from '@/design-system/components/Body/types/Body';
import { styled } from '@linaria/react';

const StyledBody = styled(BaseBody)`
  max-width: 668px;
  opacity: 0.9;
`;

type BodyProps = {
  body: BodyType;
};

export function Body({ body }: BodyProps) {
  return <StyledBody body={body} size="sm" weight="regular" />;
}
