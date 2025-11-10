import { FieldMetadataType } from '../FieldMetadataType';
import { type CompositeType } from '../composite-types/composite-type.interface';

export const linksCompositeType: CompositeType = {
  type: FieldMetadataType.LINKS,
  properties: [
    {
      name: 'primaryLinkLabel',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
    },
    {
      name: 'primaryLinkUrl',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
      isIncludedInUniqueConstraint: true,
    },
    {
      name: 'secondaryLinks',
      type: FieldMetadataType.RAW_JSON,
      hidden: false,
      isRequired: false,
    },
  ],
};

export type LinkMetadata = {
  label: string;
  url: string;
};

export type LinksMetadata = {
  primaryLinkLabel: string;
  primaryLinkUrl: string;
  secondaryLinks: LinkMetadata[] | null;
};

export type LinkMetadataNullable = {
  label: string | null;
  url: string | null;
};
