import { styled } from '@linaria/react';

import { theme } from '@/theme';

const Prose = styled.p`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(5)};
  line-height: ${theme.lineHeight(7)};
  margin: 0;
  max-width: 62ch;
  white-space: pre-wrap;
`;

const DropCap = styled.span`
  color: ${theme.colors.primary.text[100]};
  float: left;
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(14)};
  font-weight: ${theme.font.weight.light};
  line-height: 1;
  margin-bottom: ${theme.spacing(1)};
  margin-right: ${theme.spacing(2)};
`;

type PartnerProfileIntroProps = {
  introduction: string;
};

export function PartnerProfileIntro({
  introduction,
}: PartnerProfileIntroProps) {
  if (!introduction) return null;

  const firstChar = introduction.charAt(0);
  const rest = introduction.slice(1);

  return (
    <Prose>
      <DropCap aria-hidden="true">{firstChar}</DropCap>
      {rest}
    </Prose>
  );
}
