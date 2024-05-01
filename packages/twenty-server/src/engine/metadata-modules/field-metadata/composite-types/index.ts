import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import {
  CurrencyMetadata,
  currencyCompositeType,
} from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import {
  FullNameMetadata,
  fullNameCompositeType,
} from 'src/engine/metadata-modules/field-metadata/composite-types/full-name.composite-type';
import {
  LinkMetadata,
  linkCompositeType,
} from 'src/engine/metadata-modules/field-metadata/composite-types/link.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  addressCompositeType,
  AddressMetadata,
} from 'src/engine/metadata-modules/field-metadata/composite-types/address.composite-type';
import { linksCompositeType } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';

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
]);

export type CompositeMetadataTypes =
  | AddressMetadata
  | CurrencyMetadata
  | FullNameMetadata
  | LinkMetadata;
