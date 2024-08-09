import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { actorCompositeType } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { addressCompositeType } from 'src/engine/metadata-modules/field-metadata/composite-types/address.composite-type';
import { currencyCompositeType } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { fullNameCompositeType } from 'src/engine/metadata-modules/field-metadata/composite-types/full-name.composite-type';
import { linkCompositeType } from 'src/engine/metadata-modules/field-metadata/composite-types/link.composite-type';
import { linksCompositeType } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export type CompositeFieldsDefinitionFunction = (
  fieldMetadata?: FieldMetadataInterface,
) => FieldMetadataInterface[];

export const compositeTypeDefintions = new Map<
  FieldMetadataType,
  CompositeType
>([
  [FieldMetadataType.LINK, linkCompositeType],
  [FieldMetadataType.LINKS, linksCompositeType],
  [FieldMetadataType.CURRENCY, currencyCompositeType],
  [FieldMetadataType.FULL_NAME, fullNameCompositeType],
  [FieldMetadataType.ADDRESS, addressCompositeType],
  [FieldMetadataType.ACTOR, actorCompositeType],
]);
