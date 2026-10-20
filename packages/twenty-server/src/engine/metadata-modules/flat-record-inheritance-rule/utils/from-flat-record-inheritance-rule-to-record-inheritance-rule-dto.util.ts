/* @license Enterprise */

import { type FlatRecordInheritanceRule } from 'src/engine/metadata-modules/flat-record-inheritance-rule/types/flat-record-inheritance-rule.type';
import { type RecordInheritanceRuleDTO } from 'src/engine/metadata-modules/record-inheritance-rule/dtos/record-inheritance-rule.dto';

export const fromFlatRecordInheritanceRuleToRecordInheritanceRuleDto = (
  flatRecordInheritanceRule: FlatRecordInheritanceRule,
): RecordInheritanceRuleDTO => ({
  id: flatRecordInheritanceRule.id,
  objectMetadataId: flatRecordInheritanceRule.objectMetadataId,
  parentObjectMetadataId: flatRecordInheritanceRule.parentObjectMetadataId,
  fieldMetadataId: flatRecordInheritanceRule.fieldMetadataId,
  junctionFieldMetadataId: flatRecordInheritanceRule.junctionFieldMetadataId,
  applicationId: flatRecordInheritanceRule.applicationId,
});
