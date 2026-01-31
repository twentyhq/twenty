import {
  FieldActorSource,
  type FieldMetadataDefaultValue,
  FieldMetadataType,
} from 'twenty-shared/types';

// No need to refactor as unused in workspace migration v2
export function generateDefaultValue(
  type: FieldMetadataType,
): FieldMetadataDefaultValue {
  switch (type) {
    case FieldMetadataType.ACTOR:
      return {
        source: `'${FieldActorSource.MANUAL}'`,
        name: "'System'",
        workspaceMemberId: null,
      } satisfies FieldMetadataDefaultValue<FieldMetadataType.ACTOR>;
    default:
      return null;
  }
}
