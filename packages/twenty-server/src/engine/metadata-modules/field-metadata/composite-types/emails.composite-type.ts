import { FieldMetadataType } from 'twenty-shared';

import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

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
  additionalEmails: object | null;
};
