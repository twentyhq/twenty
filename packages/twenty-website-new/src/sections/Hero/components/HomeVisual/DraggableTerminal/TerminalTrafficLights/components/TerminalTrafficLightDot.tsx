import { styled } from '@linaria/react';
import type {
  MouseEvent as ReactMouseEvent,
  RefCallback,
  ComponentType,
} from 'react';
import { TRAFFIC_LIGHT_DOT_SIZE } from '../utils/terminal-traffic-light-constants';

const DotButton = styled.button<{
  $background: string;
  $backgroundActive: string;
}>`
  align-items: center;
  background: ${({ $background }) => $background};
  border: none;
  border-radius: 999px;
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  height: ${TRAFFIC_LIGHT_DOT_SIZE}px;
  justify-content: center;
  padding: 0;
  position: relative;
  transition:
    background-color 0.12s ease,
    transform 0.12s ease;
  width: ${TRAFFIC_LIGHT_DOT_SIZE}px;

  &::after {
    border-radius: 999px;
    box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.12);
    content: '';
    inset: 0;
    pointer-events: none;
    position: absolute;
  }

  svg {
    opacity: 0;
    transition: opacity 0.12s ease;
  }

  &:hover {
    background: ${({ $backgroundActive }) => $backgroundActive};

    svg {
      opacity: 1;
    }
  }

  &:active {
    transform: scale(0.92);
  }

  &[data-escaping='true'] {
    pointer-events: none;
    visibility: hidden;
  }
`;

type TerminalTrafficLightDotProps = {
  background: string;
  backgroundActive: string;
  escaping: boolean;
  Glyph: ComponentType;
  label: string;
  onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  refCallback: RefCallback<HTMLButtonElement>;
};

export const TerminalTrafficLightDot = ({
  background,
  backgroundActive,
  escaping,
  Glyph,
  label,
  onClick,
  refCallback,
}: TerminalTrafficLightDotProps) => (
  <DotButton
    aria-label={label}
    $background={background}
    $backgroundActive={backgroundActive}
    data-escaping={escaping ? 'true' : 'false'}
    onClick={onClick}
    ref={refCallback}
    type="button"
  >
    <Glyph />
  </DotButton>
);
