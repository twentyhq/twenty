'use client';

import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

import {
  STEPPER_BG,
  STEPPER_BORDER_MEDIUM,
  STEPPER_BORDER_SUBTLE,
  STEPPER_FONT,
  STEPPER_HEADER_BG,
  STEPPER_HEADER_BORDER,
  STEPPER_SHADOW_SM,
  STEPPER_TEXT,
  STEPPER_TEXT_MUTED,
  STEPPER_TEXT_TERTIARY,
} from './stepper-visual-tokens';

const Wrapper = styled.div`
  background: ${STEPPER_BG};
  border-radius: 2px;
  box-shadow: ${STEPPER_SHADOW_SM};
  display: flex;
  flex-direction: column;
  font-family: ${STEPPER_FONT};
  height: 92%;
  margin-left: auto;
  margin-top: auto;
  overflow: hidden;
  width: 88%;
`;

const Header = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  height: 30px;
  padding: 0 10px;
`;

const HeaderLogo = styled.span`
  align-items: center;
  background: ${STEPPER_HEADER_BG};
  border: 1px solid ${STEPPER_HEADER_BORDER};
  border-radius: 3px;
  color: ${STEPPER_TEXT};
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const HeaderTitle = styled.span`
  color: ${STEPPER_TEXT};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  padding: 0 2px;
`;

const HeaderActions = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  margin-left: auto;
`;

const HeaderBtn = styled.span`
  align-items: center;
  border: 1px solid ${STEPPER_BORDER_MEDIUM};
  border-radius: 4px;
  color: ${STEPPER_TEXT_MUTED};
  display: flex;
  height: 22px;
  justify-content: center;
  width: 22px;
`;

const HeaderCmdBtn = styled.span`
  align-items: center;
  border: 1px solid ${STEPPER_BORDER_SUBTLE};
  border-radius: 4px;
  color: ${STEPPER_TEXT_TERTIARY};
  display: flex;
  font-size: 12px;
  font-weight: 500;
  gap: 4px;
  height: 22px;
  padding: 0 6px;
`;

export const ShellCanvas = styled.div`
  background: white;
  border: 1px solid ${STEPPER_BORDER_MEDIUM};
  border-radius: 8px;
  flex: 1;
  margin: 0 10px 10px;
  min-height: 0;
  overflow: hidden;
  position: relative;
  user-select: none;
`;

export const ShellSvgLayer = styled.svg`
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
`;

type AppPreviewShellProps = {
  active: boolean;
  children: ReactNode;
  title: string;
};

export function AppPreviewShell({
  active,
  children,
  title,
}: AppPreviewShellProps) {
  return (
    <Wrapper style={{ opacity: active ? 1 : 0.7, transition: 'opacity 0.3s' }}>
      <Header>
        <HeaderLogo>
          <svg
            fill="none"
            height="9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="9"
          >
            <path d="M10 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
            <path d="M19.5 13a2 2 0 1 0 0 4a2 2 0 0 0 0 -4" />
            <path d="M4.5 13a2 2 0 1 0 0 4a2 2 0 0 0 0 -4" />
            <path d="M12 7v4" />
            <path d="M6.5 13l5.5 -2l5.5 2" />
          </svg>
        </HeaderLogo>
        <HeaderTitle>{title}</HeaderTitle>
        <HeaderActions>
          <HeaderBtn>
            <svg
              fill="none"
              height="14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              width="14"
            >
              <path d="M6 15l6 -6l6 6" />
            </svg>
          </HeaderBtn>
          <HeaderBtn>
            <svg
              fill="none"
              height="14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              width="14"
            >
              <path d="M6 9l6 6l6 -6" />
            </svg>
          </HeaderBtn>
          <HeaderCmdBtn>
            <svg
              fill="none"
              height="12"
              stroke="#666"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              width="12"
            >
              <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
              <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
              <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            </svg>
            ⌘K
          </HeaderCmdBtn>
        </HeaderActions>
      </Header>
      {children}
    </Wrapper>
  );
}
