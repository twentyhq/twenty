/* @license Enterprise */

import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type RecordInheritanceRuleEntity } from 'src/engine/metadata-modules/record-inheritance-rule/entities/record-inheritance-rule.entity';

export type FlatRecordInheritanceRule =
  FlatEntityFrom<RecordInheritanceRuleEntity>;
