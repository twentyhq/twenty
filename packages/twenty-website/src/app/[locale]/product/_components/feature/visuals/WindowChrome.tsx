'use client';

import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

import {
  BG_DARK,
  BORDER_COLOR,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from './visual-tokens';

const Window = styled.div`
  background-color: ${BG_DARK};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const Titlebar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${BORDER_COLOR};
  display: flex;
  flex-shrink: 0;
  gap: 12px;
  padding: 12px 16px;
`;

const TrafficLights = styled.div`
  display: flex;
  gap: 6px;
`;

const Dot = styled.span`
  border-radius: 50%;
  height: 9px;
  width: 9px;
`;

const Title = styled.span`
  color: ${TEXT_PRIMARY};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
`;

const Breadcrumb = styled.span`
  color: ${TEXT_SECONDARY};
  font-size: 11px;
  letter-spacing: 0.01em;
  margin-left: auto;
`;

const Bold = styled.span`
  color: ${TEXT_PRIMARY};
  font-weight: 600;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

type WindowChromeProps = {
  breadcrumb?: string;
  breadcrumbBold?: string;
  children: ReactNode;
  title: string;
};

export function WindowChrome({
  breadcrumb,
  breadcrumbBold,
  children,
  title,
}: WindowChromeProps) {
  return (
    <Window>
      <Titlebar>
        <TrafficLights>
          <Dot style={{ backgroundColor: '#ff5f57' }} />
          <Dot style={{ backgroundColor: '#ffbd2e' }} />
          <Dot style={{ backgroundColor: '#28c840' }} />
        </TrafficLights>
        <Title>{title}</Title>
        {breadcrumb ? (
          <Breadcrumb>
            {breadcrumb}
            {breadcrumbBold ? (
              <>
                {' / '}
                <Bold>{breadcrumbBold}</Bold>
              </>
            ) : null}
          </Breadcrumb>
        ) : null}
      </Titlebar>
      <Body>{children}</Body>
    </Window>
  );
}
