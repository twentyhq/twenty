import { theme } from '@/theme';
import { styled } from '@linaria/react';

const Line = styled.div`
  background: repeating-linear-gradient(
    to bottom,
    var(--statement-line) 0,
    var(--statement-line) 4px,
    transparent 4px,
    transparent 8px
  );
  height: 85%;
  max-height: 938px;
  pointer-events: none;
  position: absolute;
  right: ${theme.spacing(6)};
  top: 50%;
  transform: translateY(-50%);
  width: 1px;

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    display: none;
  }
`;

export function Decoration() {
  return <Line aria-hidden="true" />;
}
