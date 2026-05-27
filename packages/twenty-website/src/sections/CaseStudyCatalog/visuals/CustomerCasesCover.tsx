'use client';

import { HalftoneImageCanvas } from '@/lib/halftone';
import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import {
  buildCustomerCasesCoverSettings,
  CUSTOMER_CASES_COVER_DEFAULT_DASH_COLOR,
  CUSTOMER_CASES_COVER_DEFAULT_HOVER_DASH_COLOR,
  CUSTOMER_CASES_COVER_IMAGE_FIT,
  CUSTOMER_CASES_COVER_IMAGE_INTERACTION,
  CUSTOMER_CASES_COVER_PREVIEW_DISTANCE,
  CUSTOMER_CASES_COVER_VIRTUAL_RENDER_HEIGHT,
  resolveColorValue,
} from './customer-cases-cover-config';

const StyledVisualMount = styled.div`
  background: #000;
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

type CustomerCasesCoverProps = {
  dashColor?: string;
  hoverDashColor?: string;
  imageUrl: string;
  style?: CSSProperties;
};

export function CustomerCasesCover({
  dashColor = CUSTOMER_CASES_COVER_DEFAULT_DASH_COLOR,
  hoverDashColor = CUSTOMER_CASES_COVER_DEFAULT_HOVER_DASH_COLOR,
  imageUrl,
  style,
}: CustomerCasesCoverProps) {
  const resolvedDashColor = resolveColorValue(
    dashColor,
    CUSTOMER_CASES_COVER_DEFAULT_DASH_COLOR,
  );
  const resolvedHoverDashColor = resolveColorValue(
    hoverDashColor,
    CUSTOMER_CASES_COVER_DEFAULT_HOVER_DASH_COLOR,
  );

  return (
    <StyledVisualMount aria-hidden style={style}>
      <HalftoneImageCanvas
        crossOrigin="anonymous"
        imageFit={CUSTOMER_CASES_COVER_IMAGE_FIT}
        imageInteraction={CUSTOMER_CASES_COVER_IMAGE_INTERACTION}
        imageUrl={imageUrl}
        previewDistance={CUSTOMER_CASES_COVER_PREVIEW_DISTANCE}
        settings={buildCustomerCasesCoverSettings({
          dashColor: resolvedDashColor,
          hoverDashColor: resolvedHoverDashColor,
        })}
        virtualRenderHeight={CUSTOMER_CASES_COVER_VIRTUAL_RENDER_HEIGHT}
      />
    </StyledVisualMount>
  );
}
