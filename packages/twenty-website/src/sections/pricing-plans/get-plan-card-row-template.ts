import { PLAN_FEATURE_ROW_METRICS } from './plan-feature-row-metrics';
import { PLANS_DATA } from './plans-data';

const HEADER_PRICE_RULE_INTRO_ROWS = ['auto', 'auto', 'auto', 'auto'];
const CTA_ROW = 'auto';

const FEATURE_ROW_LIMIT = Math.max(
  ...Object.values(PLANS_DATA).flatMap((tier) =>
    Object.values(tier.cells).flatMap((billingCells) =>
      Object.values(billingCells).map((cell) => cell.features.length),
    ),
  ),
);

const getFeatureRowFloor = (featureRowIndex: number, featureCount: number) => {
  if (featureRowIndex >= featureCount) {
    return '0px';
  }

  if (featureRowIndex === 0) {
    return PLAN_FEATURE_ROW_METRICS.minHeight;
  }

  return `calc(${PLAN_FEATURE_ROW_METRICS.minHeight} + ${PLAN_FEATURE_ROW_METRICS.spacing})`;
};

export const getPlanCardRowTemplate = (featureCount: number) =>
  [
    ...HEADER_PRICE_RULE_INTRO_ROWS,
    ...Array.from(
      { length: FEATURE_ROW_LIMIT },
      (_, featureRowIndex) =>
        `minmax(${getFeatureRowFloor(featureRowIndex, featureCount)}, auto)`,
    ),
    CTA_ROW,
  ].join(' ');
