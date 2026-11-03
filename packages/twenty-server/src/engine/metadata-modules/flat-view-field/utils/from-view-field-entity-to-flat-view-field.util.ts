import { isDefined } from 'twenty-shared/utils';

import { fromConditionalDisplayToUniversalConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/from-conditional-display-to-universal-conditional-display.util';
import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { fromViewFieldOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-view-field/utils/from-view-field-overrides-to-universal-overrides.util';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

type FromViewFieldEntityToFlatViewFieldArgs =
  FromEntityToFlatEntityArgs<'viewField'> & {
    viewFieldGroupUniversalIdentifierById: Partial<Record<string, string>>;
    fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
    roleUniversalIdentifierById: Partial<Record<string, string>>;
  };

export const fromViewFieldEntityToFlatViewField = (
  args: FromViewFieldEntityToFlatViewFieldArgs,
): FlatViewField => {
  const {
    entity: viewFieldEntity,
    viewFieldGroupUniversalIdentifierById,
    fieldMetadataUniversalIdentifierById,
    roleUniversalIdentifierById,
  } = args;

  const viewFieldScalarEntity = fromEntityToScalarEntity({
    metadataName: 'viewField',
    entity: viewFieldEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'viewField',
      ...args,
    });

  const universalConditionalDisplay =
    fromConditionalDisplayToUniversalConditionalDisplay({
      conditionalDisplay: viewFieldScalarEntity.conditionalDisplay,
      fieldMetadataUniversalIdentifierById,
      roleUniversalIdentifierById,
    });

  const universalOverrides = isDefined(viewFieldEntity.overrides)
    ? fromViewFieldOverridesToUniversalOverrides({
        overrides: viewFieldEntity.overrides,
        viewFieldGroupUniversalIdentifierById,
        fieldMetadataUniversalIdentifierById,
        roleUniversalIdentifierById,
        shouldThrowOnMissingIdentifier: false,
      })
    : null;

  return {
    ...viewFieldScalarEntity,
    ...relationUniversalIdentifiers,
    universalConditionalDisplay,
    universalOverrides,
  };
};
