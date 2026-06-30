import { registerEnumType } from '@nestjs/graphql';

export enum BarChartLayout {
  VERTICAL = 'VERTICAL',
  HORIZONTAL = 'HORIZONTAL',
}

registerEnumType(BarChartLayout, {
  name: 'BarChartLayout',
  description: 'Layout orientation for bar charts',
});
