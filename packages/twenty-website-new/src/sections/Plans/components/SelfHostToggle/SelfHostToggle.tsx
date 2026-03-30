'use client';

import type { PlansHostingMode } from '@/sections/Plans/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const ToggleRow = styled.label`
  align-items: center;
  column-gap: ${theme.spacing(2)};
  cursor: pointer;
  display: grid;
  grid-template-columns: auto 1fr;
  width: 100%;
`;

const Checkbox = styled.span`
  align-items: center;
  border: 1px solid ${theme.colors.highlight[100]};
  border-radius: ${theme.radius(1)};
  display: grid;
  height: 20px;
  justify-items: center;
  width: 20px;

  &[data-checked='true'] {
    background-color: ${theme.colors.highlight[100]};
  }

  &[data-checked='false'] {
    background-color: ${theme.colors.primary.text[5]};
  }
`;

function CheckmarkIcon() {
  return (
    <svg
      aria-hidden
      fill="none"
      height="12"
      viewBox="0 0 12 12"
      width="12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m2.5 6 2.5 2.5 4.5-5"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

const HiddenInput = styled.input`
  height: 0;
  opacity: 0;
  position: absolute;
  width: 0;
`;

const LabelText = styled.span`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(5.5)};
`;

type SelfHostToggleProps = {
  hosting: PlansHostingMode;
  onHostingChange: (hosting: PlansHostingMode) => void;
};

export function SelfHostToggle({
  hosting,
  onHostingChange,
}: SelfHostToggleProps) {
  const isSelfHost = hosting === 'selfHost';

  return (
    <ToggleRow>
      <HiddenInput
        checked={isSelfHost}
        onChange={() =>
          onHostingChange(isSelfHost ? 'cloud' : 'selfHost')
        }
        type="checkbox"
      />
      <Checkbox data-checked={isSelfHost}>
        {isSelfHost && <CheckmarkIcon />}
      </Checkbox>
      <LabelText>Selfhosting</LabelText>
    </ToggleRow>
  );
}
