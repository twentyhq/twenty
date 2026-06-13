import { registerEnumType } from '@nestjs/graphql';

export enum ChartNumberFormat {
  SHORT = 'SHORT',
  FULL = 'FULL',
}

registerEnumType(ChartNumberFormat, {
  name: 'ChartNumberFormat',
  description: 'Format used to display the chart value',
});
