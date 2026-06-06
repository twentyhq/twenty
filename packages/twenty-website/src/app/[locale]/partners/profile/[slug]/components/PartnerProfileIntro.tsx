import { styled } from '@linaria/react';

import { theme } from '@/theme';

const Prose = styled.p`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(5)};
  line-height: ${theme.lineHeight(7)};
  margin: 0;
  max-width: 62ch;
  text-wrap: pretty;
  white-space: pre-wrap;
`;

type PartnerProfileIntroProps = {
  introduction: string;
};

export function PartnerProfileIntro({
  introduction,
}: PartnerProfileIntroProps) {
  if (!introduction) return null;

  return <Prose>{introduction}</Prose>;
}
