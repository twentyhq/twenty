import { FieldMetadataType } from '../FieldMetadataType';
import type { CompositeType } from './composite-type.interface';
import { actorCompositeType } from './actor.composite-type';
import { addressCompositeType } from './address.composite-type';
import { currencyCompositeType } from './currency.composite-type';
import { emailsCompositeType } from './emails.composite-type';
import { fullNameCompositeType } from './full-name.composite-type';
import { linksCompositeType } from './links.composite-type';
import { phonesCompositeType } from './phones.composite-type';
import { richTextCompositeType } from './rich-text.composite-type';

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
  [FieldMetadataType.RICH_TEXT, richTextCompositeType],
]);
