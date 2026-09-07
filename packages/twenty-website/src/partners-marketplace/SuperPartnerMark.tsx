import { styled } from '@linaria/react';

import { color, FONT_WEIGHT, fontFamily, fontSize, spacing } from '@/tokens';

const Row = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${spacing(1.5)};
`;

const Dash = styled.span`
  background-color: ${color('blue')};
  border-radius: 1px;
  flex-shrink: 0;
  height: 7px;
  width: 14px;
`;

const Word = styled.span`
  color: ${color('blue')};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.14em;
  line-height: 1.2;
  text-transform: uppercase;
  white-space: nowrap;
`;

type SuperPartnerMarkProps = {
  label: string;
};

export function SuperPartnerMark({ label }: SuperPartnerMarkProps) {
  return (
    <Row>
      <Dash aria-hidden />
      <Word>{label}</Word>
    </Row>
  );
}
