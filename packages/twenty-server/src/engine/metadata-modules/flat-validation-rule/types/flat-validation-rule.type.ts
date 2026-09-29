import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type ValidationRuleEntity } from 'src/engine/metadata-modules/validation-rule/entities/validation-rule.entity';

export type FlatValidationRule = FlatEntityFrom<ValidationRuleEntity>;
