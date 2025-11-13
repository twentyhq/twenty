import { FieldMetadataType } from 'twenty-shared/types';

import { actorCompositeType } from 'twenty-shared/src/types/composite-types/actor.composite-type';
import { addressCompositeType } from 'twenty-shared/src/types/composite-types/address.composite-type';
import { currencyCompositeType } from 'twenty-shared/src/types/composite-types/currency.composite-type';
import { emailsCompositeType } from 'twenty-shared/src/types/composite-types/emails.composite-type';
import { fullNameCompositeType } from 'twenty-shared/src/types/composite-types/full-name.composite-type';
import { imageCompositeType } from 'twenty-shared/src/types/composite-types/image.composite-type';
import { linksCompositeType } from 'twenty-shared/src/types/composite-types/links.composite-type';
import { pdfCompositeType } from 'twenty-shared/src/types/composite-types/pdf.composite-type';
import { phonesCompositeType } from 'twenty-shared/src/types/composite-types/phones.composite-type';
import { richTextV2CompositeType } from 'twenty-shared/src/types/composite-types/rich-text-v2.composite-type';

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
