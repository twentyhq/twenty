import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

const shell = PRODUCT_STEPPER_SCENE.shell;

const Wrapper = styled.div`
  background: ${shell.background};
  border-radius: 2px;
  box-shadow: ${shell.shadowSm};
  display: flex;
  flex-direction: column;
  font-family: ${shell.font};
  height: 92%;
  margin-left: auto;
  margin-top: auto;
  opacity: 0.7;
  overflow: hidden;
  transition: opacity 0.3s;
  width: 88%;

  &[data-active] {
    opacity: 1;
  }
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
  background: ${shell.headerBackground};
  border: 1px solid ${shell.headerBorder};
  border-radius: 3px;
  color: ${shell.text};
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const HeaderTitle = styled.span`
  color: ${shell.text};
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

const HeaderButton = styled.span`
  align-items: center;
  border: 1px solid ${shell.borderMedium};
  border-radius: 4px;
  color: ${shell.textMuted};
  display: flex;
  height: 22px;
  justify-content: center;
  width: 22px;
`;

const HeaderCommandButton = styled.span`
  align-items: center;
  border: 1px solid ${shell.borderSubtle};
  border-radius: 4px;
  color: ${shell.textTertiary};
  display: flex;
  font-size: 12px;
  font-weight: 500;
  gap: 4px;
  height: 22px;
  padding: 0 6px;
`;

const Canvas = styled.div`
  background: white;
  border: 1px solid ${shell.borderMedium};
  border-radius: 8px;
  flex: 1;
  margin: 0 10px 10px;
  min-height: 0;
  overflow: hidden;
  position: relative;
  user-select: none;
`;

const SvgLayer = styled.svg`
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
`;

function Shell({
  active,
  children,
  title,
}: {
  active: boolean;
  children: ReactNode;
  title: string;
}) {
  return (
    <Wrapper data-active={active ? '' : undefined}>
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
          <HeaderButton>
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
          </HeaderButton>
          <HeaderButton>
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
          </HeaderButton>
          <HeaderCommandButton>
            <svg
              fill="none"
              height="12"
              stroke={shell.textMuted}
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
          </HeaderCommandButton>
        </HeaderActions>
      </Header>
      {children}
    </Wrapper>
  );
}

export const STEPPER_SHELL_CHROME = {
  Canvas,
  Shell,
  SvgLayer,
};
