import { registerEnumType } from '@nestjs/graphql';

export enum FieldDisplayMode {
  CARD = 'CARD',
  EDITOR = 'EDITOR',
  FIELD = 'FIELD',
  VIEW = 'VIEW',
  TABLE = 'TABLE',
}

registerEnumType(FieldDisplayMode, {
  name: 'FieldDisplayMode',
  description: 'Display mode for field configuration widgets',
});
