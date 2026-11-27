import {
  type OverridableFlatEntity,
  resolveEffectiveFlatEntityProperty,
} from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

export const getEffectiveViewIsPrivate = (
  view: OverridableFlatEntity & { isPrivate: boolean },
): boolean =>
  resolveEffectiveFlatEntityProperty({
    metadataName: 'view',
    flatEntity: view,
    property: 'isPrivate',
  });
