import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from '@/application/constants/TwentyStandardApplicationUniversalIdentifier';
import { getSystemViewFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-system-view-field-universal-identifier.util';
import { getSystemViewUniversalIdentifier } from '@/application/deterministic-identifier/get-system-view-universal-identifier.util';
import { getViewFieldGroupUniversalIdentifier } from '@/application/deterministic-identifier/get-view-field-group-universal-identifier.util';
import { ViewKey } from '@/types/ViewKey';

type StandardUniversalIdentifierHolder = { universalIdentifier: string };

// Derives the engine-owned FIELDS_WIDGET record-page view universal identifiers
// for a standard object: the view (object identifier + FIELDS_WIDGET key), its
// view fields (keyed on the displayed field) and its view field groups (keyed
// on the group name within the view). Mirrors buildStandardObjectIndexView.
export const buildStandardObjectRecordPage = <
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
    viewKey: ViewKey.FIELDS_WIDGET,
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
        universalIdentifier: getViewFieldGroupUniversalIdentifier({
          applicationUniversalIdentifier:
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
