import { registerEnumType } from '@nestjs/graphql';

// Controls how a Number widget renders its aggregate value:
// SHORT abbreviates (1.3m), FULL shows the complete number with separators.
export enum ChartNumberFormat {
  SHORT = 'SHORT',
  FULL = 'FULL',
}

registerEnumType(ChartNumberFormat, {
  name: 'ChartNumberFormat',
  description: 'Format used to display the chart value',
});
