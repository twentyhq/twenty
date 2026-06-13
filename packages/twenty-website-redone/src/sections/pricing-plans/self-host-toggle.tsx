'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  spacing,
} from '@/tokens';

import { CheckMark } from '@/icons';

import { type PlansHostingMode } from './pricing-state-context';

const ToggleRow = styled.label`
  align-items: center;
  column-gap: ${spacing(2)};
  cursor: pointer;
  display: inline-grid;
  grid-template-columns: auto auto;
  justify-self: end;
  position: relative;
  white-space: nowrap;
`;

const Checkbox = styled.span`
  align-items: center;
  background-color: ${color('black-5')};
  border: 1px solid ${color('blue')};
  border-radius: ${radius(1)};
  display: grid;
  height: 16px;
  justify-items: center;
  width: 16px;

  &[data-checked] {
    background-color: ${color('blue')};
    color: ${color('white')};
  }
`;

const HiddenInput = styled.input`
  height: 0;
  opacity: 0;
  position: absolute;
  width: 0;
`;

const LabelText = styled.span`
  color: ${color('black-80')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.regular};
  line-height: 1;
`;

export function SelfHostToggle({
  hosting,
  onHostingChange,
}: {
  hosting: PlansHostingMode;
  onHostingChange: (hosting: PlansHostingMode) => void;
}) {
  const { i18n } = useLingui();
  const isSelfHost = hosting === 'selfHost';

  return (
    <ToggleRow>
      <HiddenInput
        checked={isSelfHost}
        onChange={() => onHostingChange(isSelfHost ? 'cloud' : 'selfHost')}
        type="checkbox"
      />
      <LabelText>{i18n._(msg`Selfhosting`)}</LabelText>
      <Checkbox data-checked={isSelfHost ? '' : undefined}>
        {isSelfHost ? <CheckMark /> : null}
      </Checkbox>
    </ToggleRow>
  );
}
