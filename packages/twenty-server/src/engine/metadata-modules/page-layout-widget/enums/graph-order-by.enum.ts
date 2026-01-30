import { registerEnumType } from '@nestjs/graphql';

export enum GraphOrderBy {
  FIELD_ASC = 'FIELD_ASC',
  FIELD_DESC = 'FIELD_DESC',
  FIELD_POSITION_ASC = 'FIELD_POSITION_ASC',
  FIELD_POSITION_DESC = 'FIELD_POSITION_DESC',
  VALUE_ASC = 'VALUE_ASC',
  VALUE_DESC = 'VALUE_DESC',
  MANUAL = 'MANUAL',
}

registerEnumType(GraphOrderBy, {
  name: 'GraphOrderBy',
  description: 'Order by options for graph widgets',
});
