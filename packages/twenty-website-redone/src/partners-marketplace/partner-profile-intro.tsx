import { styled } from '@linaria/react';

import { color, fontFamily, fontSize } from '@/tokens';

const Prose = styled.p`
  color: ${color('black-80')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(5)};
  line-height: ${fontSize(7)};
  max-width: 62ch;
  text-wrap: pretty;
  white-space: pre-wrap;
`;

export function PartnerProfileIntro({
  introduction,
}: {
  introduction: string;
}) {
  if (!introduction) return null;

  return <Prose>{introduction}</Prose>;
}
