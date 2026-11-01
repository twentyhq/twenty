import { isString } from '@sniptt/guards';
import { type CSSProperties } from 'react';

type GetProgressIndicatorPercentageParams = {
  width: CSSProperties['width'];
  fallbackPercentage: number;
};

export const getProgressIndicatorPercentage = ({
  width,
  fallbackPercentage,
}: GetProgressIndicatorPercentageParams) =>
  isString(width) ? Number.parseFloat(width) : fallbackPercentage;
