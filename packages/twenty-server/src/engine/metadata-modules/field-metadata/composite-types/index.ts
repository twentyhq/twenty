import {
  FieldMetadataType,
  actorCompositeType,
  addressCompositeType,
  currencyCompositeType,
  emailsCompositeType,
  fullNameCompositeType,
  imageCompositeType,
  linksCompositeType,
  pdfCompositeType,
  phonesCompositeType,
  richTextV2CompositeType,
} from 'twenty-shared/types';

import { type CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

export const compositeTypeDefinitions = new Map<
  FieldMetadataType,
  CompositeType
>([
  [FieldMetadataType.LINKS, linksCompositeType],
  [FieldMetadataType.CURRENCY, currencyCompositeType],
  [FieldMetadataType.FULL_NAME, fullNameCompositeType],
  [FieldMetadataType.ADDRESS, addressCompositeType],
  [FieldMetadataType.ACTOR, actorCompositeType],
  [FieldMetadataType.EMAILS, emailsCompositeType],
  [FieldMetadataType.PHONES, phonesCompositeType],
  [FieldMetadataType.RICH_TEXT_V2, richTextV2CompositeType],
  [FieldMetadataType.PDF, pdfCompositeType],
  [FieldMetadataType.IMAGE, imageCompositeType],
]);
