import { registerEnumType } from '@nestjs/graphql';

export enum AxisNameDisplay {
  NONE = 'NONE',
  X = 'X',
  Y = 'Y',
  BOTH = 'BOTH',
}

registerEnumType(AxisNameDisplay, {
  name: 'AxisNameDisplay',
  description: 'Which axes should display labels',
});
