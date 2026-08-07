import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from '@/application/constants/TwentyStandardApplicationUniversalIdentifier';
import { getSystemViewFieldGroupUniversalIdentifier } from '@/application/deterministic-identifier/get-system-view-field-group-universal-identifier.util';
import { getSystemViewFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-system-view-field-universal-identifier.util';
import {
  SYSTEM_VIEW_KEYS,
  getSystemViewUniversalIdentifier,
} from '@/application/deterministic-identifier/get-system-view-universal-identifier.util';

type StandardUniversalIdentifierHolder = { universalIdentifier: string };

export const buildStandardObjectRecordPageFieldsView = <
  const TViewFieldName extends string,
  const TViewFieldGroupName extends string,
>({
  objectUniversalIdentifier,
  fields,
  viewFieldNames,
  viewFieldGroupNames,
}: {
  objectUniversalIdentifier: string;
  fields: Record<string, StandardUniversalIdentifierHolder>;
  viewFieldNames: readonly TViewFieldName[];
  viewFieldGroupNames: Record<TViewFieldGroupName, string>;
}): {
  universalIdentifier: string;
  viewFields: Record<TViewFieldName, StandardUniversalIdentifierHolder>;
  viewFieldGroups: Record<
    TViewFieldGroupName,
    StandardUniversalIdentifierHolder
  >;
} => {
  const viewUniversalIdentifier = getSystemViewUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier,
    viewKey: SYSTEM_VIEW_KEYS.FIELDS_WIDGET,
  });

  const viewFields = Object.fromEntries(
    viewFieldNames.map((viewFieldName) => {
      const field = fields[viewFieldName];

      if (field === undefined) {
        throw new Error(
          `Missing field "${viewFieldName}" for the record-page view of object ${objectUniversalIdentifier}`,
        );
      }

      return [
        viewFieldName,
        {
          universalIdentifier: getSystemViewFieldUniversalIdentifier({
            fieldMetadataApplicationUniversalIdentifier:
              TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
            viewUniversalIdentifier,
            fieldMetadataUniversalIdentifier: field.universalIdentifier,
          }),
        },
      ];
    }),
  ) as Record<TViewFieldName, StandardUniversalIdentifierHolder>;

  const viewFieldGroups = Object.fromEntries(
    (
      Object.entries(viewFieldGroupNames) as [TViewFieldGroupName, string][]
    ).map(([viewFieldGroupKey, viewFieldGroupName]) => [
      viewFieldGroupKey,
      {
        universalIdentifier: getSystemViewFieldGroupUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          viewUniversalIdentifier,
          name: viewFieldGroupName,
        }),
      },
    ]),
  ) as Record<TViewFieldGroupName, StandardUniversalIdentifierHolder>;

  return {
    universalIdentifier: viewUniversalIdentifier,
    viewFields,
    viewFieldGroups,
  };
};
