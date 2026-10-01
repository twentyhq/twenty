import {
  FieldActorSource,
  type FieldMetadataDefaultValue,
  FieldMetadataType,
} from 'twenty-shared/types';

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
