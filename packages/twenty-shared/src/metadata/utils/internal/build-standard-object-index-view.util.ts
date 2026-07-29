import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from '@/application/constants/TwentyStandardApplicationUniversalIdentifier';
import { getSystemViewUniversalIdentifier } from '@/application/deterministic-identifier/get-system-view-universal-identifier.util';
import { getViewFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-view-field-universal-identifier.util';
import { ViewKey } from '@/types/ViewKey';

type StandardViewFieldUniversalIdentifier = { universalIdentifier: string };

export const buildStandardObjectIndexView = <
  const TViewFieldName extends string,
>({
  objectUniversalIdentifier,
  fields,
  viewFieldNames,
}: {
  objectUniversalIdentifier: string;
  fields: Record<string, StandardViewFieldUniversalIdentifier>;
  viewFieldNames: readonly TViewFieldName[];
}): {
  universalIdentifier: string;
  viewFields: Record<TViewFieldName, StandardViewFieldUniversalIdentifier>;
} => {
  const viewUniversalIdentifier = getSystemViewUniversalIdentifier({
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier,
    viewKey: ViewKey.INDEX,
  });

  const viewFields = Object.fromEntries(
    viewFieldNames.map((viewFieldName) => {
      const field = fields[viewFieldName];

      if (field === undefined) {
        throw new Error(
          `Missing field "${viewFieldName}" for the INDEX view of object ${objectUniversalIdentifier}`,
        );
      }

      return [
        viewFieldName,
        {
          universalIdentifier: getViewFieldUniversalIdentifier({
            applicationUniversalIdentifier:
              TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
            viewUniversalIdentifier,
            fieldMetadataUniversalIdentifier: field.universalIdentifier,
          }),
        },
      ];
    }),
  ) as Record<TViewFieldName, StandardViewFieldUniversalIdentifier>;

  return {
    universalIdentifier: viewUniversalIdentifier,
    viewFields,
  };
};
