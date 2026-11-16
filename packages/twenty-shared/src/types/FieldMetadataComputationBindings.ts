import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';

// Filled by the server when the field is saved, as for a validation rule: each path the
// computation reads, from the field's own object, and the universal identifier of the field it resolved to
export type FieldMetadataComputationBindings = ValidationRuleBindings;
