import { FieldMetadataType } from 'twenty-shared/types';

import { type CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { actorCompositeType } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { addressCompositeType } from 'src/engine/metadata-modules/field-metadata/composite-types/address.composite-type';
import { currencyCompositeType } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { emailsCompositeType } from 'src/engine/metadata-modules/field-metadata/composite-types/emails.composite-type';
import { fullNameCompositeType } from 'src/engine/metadata-modules/field-metadata/composite-types/full-name.composite-type';
import { imageCompositeType } from 'src/engine/metadata-modules/field-metadata/composite-types/image.composite-type';
import { linksCompositeType } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';
import { pdfCompositeType } from 'src/engine/metadata-modules/field-metadata/composite-types/pdf.composite-type';
import { phonesCompositeType } from 'src/engine/metadata-modules/field-metadata/composite-types/phones.composite-type';
import { richTextV2CompositeType } from 'src/engine/metadata-modules/field-metadata/composite-types/rich-text-v2.composite-type';

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
