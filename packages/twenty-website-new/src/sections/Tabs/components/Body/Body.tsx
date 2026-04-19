import { Body as BaseBody } from '@/design-system/components';
import { BodyType } from '@/design-system/components/Body/types/Body';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const StyledBody = styled(BaseBody)`
  --body-sm-color: color-mix(in srgb, currentColor 80%, transparent);
  margin-top: calc(${theme.spacing(2)} - ${theme.spacing(6)});
  margin-bottom: ${theme.spacing(12)};
`;

type BodyProps = {
  body: BodyType;
};

export function Body({ body }: BodyProps) {
  return <StyledBody body={body} size="sm" />;
}
