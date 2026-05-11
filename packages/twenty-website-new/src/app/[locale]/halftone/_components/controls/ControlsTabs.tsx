import { theme } from '@/theme';
import { styled } from '@linaria/react';

export const TabsBar = styled.div<{ $collapsed?: boolean }>`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  margin: 0;
  padding: ${(props) => (props.$collapsed ? '12px' : '12px 12px 0')};
`;

export const TabButton = styled.button<{ $active: boolean }>`
  background: ${(props) =>
    props.$active ? 'rgba(255, 255, 255, 0.08)' : 'transparent'};
  border: none;
  border-radius: 7px;
  color: ${(props) =>
    props.$active ? 'rgba(255, 255, 255, 0.94)' : 'rgba(255, 255, 255, 0.52)'};
  cursor: pointer;
  font-family: ${theme.font.family.sans};
  font-size: 12px;
  font-weight: ${(props) => (props.$active ? 600 : 500)};
  letter-spacing: 0;
  line-height: 1;
  padding: 8px 10px;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: ${(props) =>
      props.$active ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.04)'};
    color: ${(props) =>
      props.$active
        ? 'rgba(255, 255, 255, 0.94)'
        : 'rgba(255, 255, 255, 0.74)'};
  }

  &:focus-visible {
    outline: 1px solid rgba(255, 255, 255, 0.35);
    outline-offset: 1px;
  }
`;

export const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;
