'use client';

import { styled } from '@linaria/react';

import { REDUCED_MOTION } from '@/tokens';
import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

const SkeletonBase = styled.div`
  animation: previewSkeletonShimmer 1.4s ease infinite;
  background: linear-gradient(
    90deg,
    ${APP_PREVIEW_THEME.border.color.light} 25%,
    ${APP_PREVIEW_THEME.background.secondary} 37%,
    ${APP_PREVIEW_THEME.border.color.light} 63%
  );
  background-size: 400% 100%;

  @keyframes previewSkeletonShimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: 0 0;
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const Bar = styled(SkeletonBase)<{
  $height?: number;
  $radius?: number;
  $width?: string;
}>`
  border-radius: ${({ $radius = 4 }) => `${$radius}px`};
  flex-shrink: 0;
  height: ${({ $height = 10 }) => `${$height}px`};
  width: ${({ $width = '100%' }) => $width};
`;

const Circle = styled(SkeletonBase)<{ $size: number }>`
  border-radius: 50%;
  flex-shrink: 0;
  height: ${({ $size }) => `${$size}px`};
  width: ${({ $size }) => `${$size}px`};
`;

export const PREVIEW_SKELETON = { Bar, Circle };
