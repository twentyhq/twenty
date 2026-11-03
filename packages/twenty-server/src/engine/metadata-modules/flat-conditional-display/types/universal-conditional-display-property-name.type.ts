import { type ConditionalDisplayProperty } from 'src/engine/metadata-modules/flat-conditional-display/types/conditional-display-property.type';

export type UniversalConditionalDisplayPropertyName<
  TProperty extends ConditionalDisplayProperty,
> = `universal${Capitalize<TProperty>}`;
