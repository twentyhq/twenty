import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from '@/application/constants/TwentyStandardApplicationUniversalIdentifier';
import { getViewFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-view-field-universal-identifier.util';
import { getSystemViewUniversalIdentifier } from '@/application/deterministic-identifier/get-view-universal-identifier.util';
import { ViewKey } from '@/types/ViewKey';

type StandardViewFieldUniversalIdentifier = { universalIdentifier: string };

// The INDEX view ("All {objectLabelPlural}") and its view fields are owned by
// the metadata side-effect engine, so their universal identifiers are
// deterministically derived rather than hardcoded: the view from the object
// universal identifier + the stable INDEX view key
// (getSystemViewUniversalIdentifier), and each view field from the view + the
// field it displays (getViewFieldUniversalIdentifier).
//
// `derivedViewFieldNames` are the fields the standard INDEX view builder emits.
// `preservedViewFields` carries legacy entries that are no longer emitted
// verbatim, so their committed universal identifiers are never mutated.
export const buildStandardObjectIndexView = <
  const TDerivedViewFieldName extends string,
  const TPreservedViewFieldName extends string = never,
>({
  objectUniversalIdentifier,
  fields,
  derivedViewFieldNames,
  preservedViewFields,
}: {
  objectUniversalIdentifier: string;
  fields: Record<string, StandardViewFieldUniversalIdentifier>;
  derivedViewFieldNames: readonly TDerivedViewFieldName[];
  preservedViewFields?: Record<
    TPreservedViewFieldName,
    StandardViewFieldUniversalIdentifier
  >;
}): {
  universalIdentifier: string;
  viewFields: Record<
    TDerivedViewFieldName | TPreservedViewFieldName,
    StandardViewFieldUniversalIdentifier
  >;
} => {
  const viewUniversalIdentifier = getSystemViewUniversalIdentifier({
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier,
    viewKey: ViewKey.INDEX,
  });

  const derivedViewFields = Object.fromEntries(
    derivedViewFieldNames.map((viewFieldName) => {
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
  ) as Record<TDerivedViewFieldName, StandardViewFieldUniversalIdentifier>;

  return {
    universalIdentifier: viewUniversalIdentifier,
    viewFields: {
      ...(preservedViewFields ??
        ({} as Record<
          TPreservedViewFieldName,
          StandardViewFieldUniversalIdentifier
        >)),
      ...derivedViewFields,
    },
  };
};
