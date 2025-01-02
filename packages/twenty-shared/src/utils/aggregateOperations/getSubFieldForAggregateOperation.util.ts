import { FieldMetadataType } from 'src/types/FieldMetadataType';
import { isCompositeFieldMetadataType } from 'src/utils/aggregateOperations/isCompositeFieldMetadataType.util';

export const getSubfieldForAggregateOperation = (
  fieldType: FieldMetadataType,
) => {
  if (!isCompositeFieldMetadataType(fieldType)) {
    return undefined;
  } else {
    switch (fieldType) {
      case FieldMetadataType.CURRENCY:
        return 'amountMicros';
      case FieldMetadataType.FULL_NAME:
        return 'lastName';
      case FieldMetadataType.ADDRESS:
        return 'addressStreet1';
      case FieldMetadataType.LINKS:
        return 'primaryLinkLabel';
      case FieldMetadataType.ACTOR:
        return 'workspaceMemberId';
      case FieldMetadataType.EMAILS:
        return 'primaryEmail';
      case FieldMetadataType.PHONES:
        return 'primaryPhoneNumber';
      default:
        throw new Error(`Unsupported composite field type: ${fieldType}`);
    }
  }
};
