import { ALL_OVERRIDE_ENTRY_PROPERTY_NAMES } from 'src/engine/metadata-modules/overrides/constants/all-override-entry-property-names.constant';
import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/overrides/types/override-author-context.type';
import {
  type OverridableFlatEntity,
  resolveEffectiveFlatEntityProperty,
} from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

type FlatEntityWithOverrides = Record<string, unknown> & OverridableFlatEntity;

// Walks the overridable registry rather than the entries' keys so the entry
// walk stays private to readAuthoredOverrideProperty; a name the entity does
// not carry, such as a universal twin's, is skipped.
export const resolveEffectiveFlatEntity = <T extends FlatEntityWithOverrides>(
  flatEntity: T,
  authorContext?: Pick<
    OverrideAuthorReadContext,
    'workspaceCustomApplicationUniversalIdentifier'
  >,
): T =>
  [...ALL_OVERRIDE_ENTRY_PROPERTY_NAMES]
    .filter((property) => property !== 'translations' && property in flatEntity)
    .reduce<T>(
      (effectiveEntity, property) => ({
        ...effectiveEntity,
        [property]: resolveEffectiveFlatEntityProperty(
          flatEntity as FlatEntityWithOverrides,
          property,
          authorContext,
        ),
      }),
      flatEntity,
    );
