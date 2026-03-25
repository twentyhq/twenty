import { FieldMetadataType } from '../FieldMetadataType';
import { type CompositeType } from '../composite-types/composite-type.interface';

export const emailsCompositeType: CompositeType = {
  type: FieldMetadataType.EMAILS,
  properties: [
    {
      name: 'primaryEmail',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
      isIncludedInUniqueConstraint: true,
    },
    {
      name: 'additionalEmails',
      type: FieldMetadataType.RAW_JSON,
      hidden: false,
      isRequired: false,
    },
  ],
};

export type EmailsMetadata = {
  primaryEmail: string;
  additionalEmails: string[] | null;
};
