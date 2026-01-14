import { registerEnumType } from '@nestjs/graphql';

export enum GraphColorMode {
  EXPLICIT_SINGLE_COLOR = 'explicitSingleColor',
  SELECT_FIELD_OPTION_COLORS = 'selectFieldOptionColors',
  AUTOMATIC_PALETTE = 'automaticPalette',
}

registerEnumType(GraphColorMode, {
  name: 'GraphColorMode',
  description: 'Mode for determining chart element colors',
});
