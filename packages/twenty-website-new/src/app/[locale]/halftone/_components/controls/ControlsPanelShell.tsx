import { theme } from '@/theme';
import { styled } from '@linaria/react';

import { TAB_LABEL_WIDTH } from './controls-form-constants';

export const PanelShell = styled.aside<{ $collapsed?: boolean }>`
  background: rgba(18, 18, 22, 0.88);
  /* -webkit- prefix is required for the blur to render on Safari < 18. */
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  font-family: ${theme.font.family.sans};
  font-size: 11px;
  height: ${(props) => (props.$collapsed ? 'auto' : '100%')};
  overflow: hidden;
  width: ${(props) =>
    props.$collapsed ? 'auto' : 'min(320px, calc(100vw - 32px))'};

  @media (max-width: ${theme.breakpoints.md - 1}px) {
    height: ${(props) => (props.$collapsed ? 'auto' : '100%')};
    width: ${(props) => (props.$collapsed ? 'auto' : '100%')};
  }
`;

export const ControlGrid = styled.div`
  display: grid;
  gap: 10px;
`;

export const ValueDisplay = styled.div`
  align-items: center;
  background-color: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: 11px;
  min-height: 31px;
  overflow: hidden;
  padding: 7px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

export const ShapeRow = styled.div`
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: ${TAB_LABEL_WIDTH}px minmax(0, 1fr) auto;
`;

export const UploadButton = styled.button`
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-size: 13px;
  height: 24px;
  justify-content: center;
  transition: all 0.15s ease;
  width: 24px;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.22);
    color: rgba(255, 255, 255, 0.8);
  }
`;

export const ExportNameInput = styled.input`
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  font-family: ${theme.font.family.sans};
  font-size: 11px;
  margin-bottom: 14px;
  outline: none;
  padding: 7px 10px;
  transition: border-color 0.15s ease;
  width: 100%;

  &:hover {
    border-color: rgba(255, 255, 255, 0.25);
  }

  &:focus {
    border-color: #4a38f5;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

export const ExportPreview = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.55);
  font-family: ${theme.font.family.mono};
  font-size: 10px;
  line-height: 1.5;
  margin-bottom: 14px;
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
`;

export const ExportButton = styled.button<{ $primary?: boolean }>`
  align-items: center;
  background: ${(props) =>
    props.$primary ? 'rgba(255, 255, 255, 0.24)' : 'rgba(255, 255, 255, 0.2)'};
  border: none;
  border-radius: 8px;
  color: ${(props) =>
    props.$primary ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.8)'};
  cursor: pointer;
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: 11px;
  font-weight: ${theme.font.weight.medium};
  gap: 8px;
  justify-content: center;
  line-height: normal;
  margin-top: ${(props) => (props.$primary ? '0' : '8px')};
  padding: 7px 12px;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
  width: 100%;

  &:hover {
    background: ${(props) =>
      props.$primary
        ? 'rgba(255, 255, 255, 0.28)'
        : 'rgba(255, 255, 255, 0.24)'};
    color: rgba(255, 255, 255, 0.92);
  }

  &:active {
    background: ${(props) =>
      props.$primary
        ? 'rgba(255, 255, 255, 0.3)'
        : 'rgba(255, 255, 255, 0.28)'};
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 1px solid rgba(255, 255, 255, 0.36);
    outline-offset: 2px;
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.36);
    cursor: not-allowed;
    transform: none;
  }
`;

export const ExportNote = styled.div`
  color: rgba(255, 255, 255, 0.3);
  font-size: 10px;
  line-height: 1.5;
  margin-top: 12px;
`;

export const SmallBody = styled.p`
  color: rgba(255, 255, 255, 0.45);
  font-size: 10px;
  line-height: 1.6;
  margin-bottom: 14px;
`;
