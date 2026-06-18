import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { PRODUCT_FEATURE_SCENE } from '@/tokens/feature-scenes/product-feature-scene';

const scene = PRODUCT_FEATURE_SCENE.window;

const Window = styled.div`
  background-color: ${scene.background};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const Titlebar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${scene.border};
  display: flex;
  flex-shrink: 0;
  gap: 12px;
  padding: 12px 16px;
`;

const TrafficLights = styled.div`
  display: flex;
  gap: 6px;
`;

const Dot = styled.span<{ $ink: string }>`
  background-color: ${({ $ink }) => $ink};
  border-radius: 50%;
  height: 9px;
  width: 9px;
`;

const Title = styled.span`
  color: ${scene.textPrimary};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
`;

const Breadcrumb = styled.span`
  color: ${scene.textSecondary};
  font-size: 11px;
  letter-spacing: 0.01em;
  margin-left: auto;
`;

const Bold = styled.span`
  color: ${scene.textPrimary};
  font-weight: 600;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

// The feature visuals' shared dark mini-window (its own authored stage —
// not the product mockup's chrome).
export function WindowChrome({
  breadcrumb,
  breadcrumbBold,
  children,
  title,
}: {
  breadcrumb?: string;
  breadcrumbBold?: string;
  children: ReactNode;
  title: string;
}) {
  return (
    <Window>
      <Titlebar>
        <TrafficLights>
          <Dot $ink={scene.trafficDots.close} />
          <Dot $ink={scene.trafficDots.minimize} />
          <Dot $ink={scene.trafficDots.zoom} />
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
