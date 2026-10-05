import { type ValidationRuleFieldDescriptor } from './ValidationRuleFieldDescriptor';

export type ValidationRuleResolvedIdentifierPath =
  | { type: 'now' }
  | {
      type: 'field';
      rootField: ValidationRuleFieldDescriptor;
      targetField: ValidationRuleFieldDescriptor | null;
      subfieldName: string | null;
    };
