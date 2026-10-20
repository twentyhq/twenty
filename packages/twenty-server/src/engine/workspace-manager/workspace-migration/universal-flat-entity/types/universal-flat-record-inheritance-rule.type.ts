/* @license Enterprise */

import { type RecordInheritanceRuleEntity } from 'src/engine/metadata-modules/record-inheritance-rule/entities/record-inheritance-rule.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatRecordInheritanceRule = UniversalFlatEntityFrom<
  RecordInheritanceRuleEntity,
  'recordInheritanceRule'
>;
