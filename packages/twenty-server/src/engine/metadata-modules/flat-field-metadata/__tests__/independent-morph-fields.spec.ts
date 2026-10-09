import { validateMorphRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-relation-flat-field-metadata.util';
import { ComputeApplicationManifestAllUniversalFlatEntityMapsService } from 'src/engine/core-modules/application/application-manifest/services/compute-application-manifest-all-universal-flat-entity-maps.service';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { filterMorphRelationTargetFields } from 'src/engine/dataloaders/utils/filter-morph-relation-target-fields.util';
import { computeFlatIndexFieldColumnNames } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { getSystemViewFieldUniversalIdentifier } from 'twenty-shared/application';
import { Test } from '@nestjs/testing';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, type FeatureFlagKey } from 'twenty-shared/types';
import { isDefined, isMorphRelationGroup } from 'twenty-shared/utils';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { isFlatFieldMetadataEligibleForRecordForm } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/is-flat-field-metadata-eligible-for-record-form.util';
import { addMorphFieldsForLegacyManifest } from 'src/engine/core-modules/application/application-manifest/utils/add-morph-fields-for-legacy-manifest.util';
import { fromFlatFieldMetadataToFieldManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-field-metadata-to-field-manifest.util';
import { fromFieldManifestToUniversalFlatFieldMetadata } from 'src/engine/core-modules/application/application-manifest/converters/from-field-manifest-to-universal-flat-field-metadata.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { buildMorphFieldReferenceUpdates } from 'src/database/commands/upgrade-version-command/2-46/utils/build-morph-field-reference-updates.util';
import { buildIndependentMorphFields } from 'src/database/commands/upgrade-version-command/2-46/utils/build-independent-morph-fields.util';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeFlatFieldMetadataRelatedFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-flat-field-metadata-related-flat-field-metadata.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { resolveMorphRelationsFromFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/resolve-morph-relations-from-flat-field-metadata.util';
import { resolveRelationFromFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/resolve-relation-from-flat-field-metadata.util';
import { NavigationMenuItemRecordIdentifierService } from 'src/engine/metadata-modules/navigation-menu-item/services/navigation-menu-item-record-identifier.service';
import { WorkspaceRolesPermissionsCacheService } from 'src/engine/metadata-modules/role/services/workspace-roles-permissions-cache.service';
import { MetadataEventPublisher } from 'src/engine/subscriptions/metadata-event/metadata-event-publisher';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';

const createMaps = <TEntity extends SyncableFlatEntity>(
  flatEntities: TEntity[],
) =>
  addAllFlatEntitiesToFlatEntityMaps({
    flatEntities,
    flatEntityMaps: createEmptyFlatEntityMaps(),
  });

const fixture = () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
      twentyStandardApplicationId: '20202020-0000-4000-8000-000000000001',
      now: '2026-10-09T12:00:00.000Z',
    });
  const fields = Object.values(
    allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);
  const objects = Object.values(
    allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .map((object) => ({
      ...object,
      fieldIds: fields
        .filter((field) => field.objectMetadataId === object.id)
        .map((field) => field.id),
    }));
  const group = fields.find(
    (field) =>
      field.universalIdentifier ===
      STANDARD_OBJECTS.noteTarget.fields.target.universalIdentifier,
  )!;
  const object = objects.find(
    (objectMetadata) => objectMetadata.id === group.objectMetadataId,
  )!;
  const targets = fields.filter(
    (field) => field.morphId === group.morphId && field.id !== group.id,
  );
  return {
    ...allFlatEntityMaps,
    flatFieldPermissionMaps: createEmptyFlatEntityMaps(),
    flatObjectMetadataMaps: createMaps(objects),
    fields,
    objects,
    group,
    object,
    targets,
  };
};

describe('independent morph fields', () => {
  it('keeps the persisted field out of physical columns and record schemas', () => {
    const { group, object, targets, flatFieldMetadataMaps } = fixture();
    expect(
      generateColumnDefinitions({
        flatFieldMetadata: group,
        flatObjectMetadata: object,
        workspaceId: group.workspaceId,
      }),
    ).toEqual([]);
    const recordFields = getFlatFieldsFromFlatObjectMetadata(
      object,
      flatFieldMetadataMaps,
    );
    expect(recordFields).not.toContain(group);
    expect(recordFields).toEqual(expect.arrayContaining(targets));
  });

  it.each([0, 1, 2, 3])(
    'resolves the same group with %i targets remaining',
    (count) => {
      const { group, object, targets, fields, objects } = fixture();
      const remainingTargets = targets.slice(0, count);
      const removedIds = new Set(targets.slice(count).map((field) => field.id));
      const flatFieldMetadataMaps = createMaps(
        fields.filter((field) => !removedIds.has(field.id)),
      );
      const flatObjectMetadataMaps = createMaps(
        objects.map((objectMetadata) => ({
          ...objectMetadata,
          fieldIds: objectMetadata.fieldIds.filter((id) => !removedIds.has(id)),
        })),
      );
      if (!isFlatFieldMetadataOfType(group, FieldMetadataType.MORPH_RELATION))
        throw new Error('Expected morph field');
      const relations = resolveMorphRelationsFromFlatFieldMetadata({
        morphFlatFieldMetadata: group,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      });
      expect(relations).toHaveLength(count);
      expect(
        relations.map((relation) => relation.sourceFieldMetadata.id),
      ).toEqual(remainingTargets.map((field) => field.id));
      for (const target of remainingTargets) {
        const inverse = fields.find(
          (field) => field.id === target.relationTargetFieldMetadataId,
        )!;
        if (!isFlatFieldMetadataOfType(inverse, FieldMetadataType.RELATION))
          throw new Error('Expected inverse relation');
        expect(
          resolveRelationFromFlatFieldMetadata({
            sourceFlatFieldMetadata: inverse,
            flatFieldMetadataMaps,
            flatObjectMetadataMaps,
          })?.targetFieldMetadata.id,
        ).toBe(group.id);
      }
      expect(
        flatObjectMetadataMaps.byUniversalIdentifier[object.universalIdentifier]
          ?.fieldIds,
      ).toContain(group.id);
    },
  );

  it('deleting a target removes its inverse; deleting the group removes all targets', () => {
    const { group, object, targets, flatFieldMetadataMaps } = fixture();
    const relatedToTarget = computeFlatFieldMetadataRelatedFlatFieldMetadata({
      flatFieldMetadata: targets[0],
      flatObjectMetadata: object,
      flatFieldMetadataMaps,
    });
    expect(relatedToTarget.map((field) => field.id)).toEqual([
      targets[0].relationTargetFieldMetadataId,
    ]);
    const relatedToGroup = computeFlatFieldMetadataRelatedFlatFieldMetadata({
      flatFieldMetadata: group,
      flatObjectMetadata: object,
      flatFieldMetadataMaps,
    });
    expect(relatedToGroup.map((field) => field.id).sort()).toEqual(
      targets
        .flatMap((target) => [target.id, target.relationTargetFieldMetadataId])
        .sort(),
    );
  });

  it('upgrades each old group once without changing the target fields', () => {
    const {
      fields,
      objects,
      flatFieldMetadataMaps: standardFlatFieldMetadataMaps,
    } = fixture();
    const oldFields = fields.filter((field) => !isMorphRelationGroup(field));
    const oldFieldMaps = createMaps(oldFields);
    const newFields = buildIndependentMorphFields({
      flatFieldMetadataMaps: oldFieldMaps,
      flatObjectMetadataMaps: createMaps(objects),
      standardFlatFieldMetadataMaps,
    });
    expect(newFields).toHaveLength(7);
    for (const field of newFields) {
      expect(isMorphRelationGroup(field)).toBe(true);
      expect(field.relationTargetFieldMetadataId).toBeNull();
      expect(field.relationTargetObjectMetadataId).toBeNull();
      expect(field.settings).not.toHaveProperty('joinColumnName');
    }
    expect(Object.values(oldFieldMaps.byUniversalIdentifier)).toEqual(
      oldFields,
    );
    expect(
      buildIndependentMorphFields({
        flatFieldMetadataMaps: createMaps([...oldFields, ...newFields]),
        flatObjectMetadataMaps: createMaps(objects),
        standardFlatFieldMetadataMaps,
      }),
    ).toEqual([]);
  });

  it('applies a group restriction to every target, including a newly added target', () => {
    const { group, targets, object } = fixture();
    const newTarget = {
      ...targets[0],
      id: 'new-target',
      universalIdentifier: 'new-target-universal',
    };
    const service = new WorkspaceRolesPermissionsCacheService();
    const result = service.computeForCache({
      workspaceId: group.workspaceId,
      rows: {
        role: [
          {
            id: 'role',
            canAccessAllTools: false,
            canUpdateAllSettings: false,
            canSoftDeleteAllObjectRecords: true,
            canDestroyAllObjectRecords: true,
            canReadAllObjectRecords: true,
            canUpdateAllObjectRecords: true,
          },
        ],
        objectMetadata: [{ ...object, isSystem: false }],
        fieldMetadata: [group, ...targets, newTarget],
        permissionFlag: [],
        objectPermission: { rows: [], byRoleId: new Map() },
        rolePermissionFlag: { rows: [], byRoleId: new Map() },
        fieldPermission: {
          rows: [],
          byRoleId: new Map([
            [
              'role',
              [
                {
                  roleId: 'role',
                  objectMetadataId: object.id,
                  fieldMetadataId: group.id,
                  canReadFieldValue: false,
                  canUpdateFieldValue: false,
                },
              ],
            ],
          ]),
        },
        rowLevelPermissionPredicate: { rows: [], byRoleId: new Map() },
        rowLevelPermissionPredicateGroup: { rows: [], byRoleId: new Map() },
      },
    });
    for (const field of [group, ...targets, newTarget]) {
      expect(result.role[object.id].restrictedFields[field.id]).toEqual({
        canRead: false,
        canUpdate: false,
      });
    }
  });

  it.each([false, true])(
    'publishes target deletion as a group update (last target: %s)',
    async (lastTarget) => {
      const { group, targets, fields, objects } = fixture();
      const removedIds = new Set(
        (lastTarget ? targets : targets.slice(0, 1)).map((field) => field.id),
      );
      const broadcast = jest.fn();
      const module = await Test.createTestingModule({
        providers: [
          MetadataEventPublisher,
          { provide: WorkspaceEventBroadcaster, useValue: { broadcast } },
          { provide: NavigationMenuItemRecordIdentifierService, useValue: {} },
          {
            provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
            useValue: {
              getOrRecomputeManyOrAllFlatEntityMaps: jest
                .fn()
                .mockResolvedValue({
                  flatFieldMetadataMaps: createMaps(
                    fields.filter((field) => !removedIds.has(field.id)),
                  ),
                  flatObjectMetadataMaps: createMaps(
                    objects.map((objectMetadata) => ({
                      ...objectMetadata,
                      fieldIds: objectMetadata.fieldIds.filter(
                        (id) => !removedIds.has(id),
                      ),
                    })),
                  ),
                }),
            },
          },
        ],
      }).compile();
      await module.get(MetadataEventPublisher).publish({
        name: 'metadata.fieldMetadata.deleted',
        workspaceId: group.workspaceId,
        metadataName: 'fieldMetadata',
        type: 'deleted',
        events: [
          {
            metadataName: 'fieldMetadata',
            type: 'deleted',
            recordId: targets[0].id,
            properties: { before: targets[0] },
          },
        ],
      });
      expect(broadcast.mock.calls[0][0].events).toEqual([
        expect.objectContaining({
          type: 'updated',
          recordId: group.id,
          properties: expect.objectContaining({
            after: expect.objectContaining({
              id: group.id,
              name: 'target',
              morphRelations: expect.any(Array),
            }),
          }),
        }),
      ]);
      expect(
        broadcast.mock.calls[0][0].events[0].properties.after.morphRelations,
      ).toHaveLength(lastTarget ? 0 : targets.length - 1);
      await module.close();
    },
  );
  it('moves a saved column to the group and preserves its display settings', () => {
    const maps = fixture();
    const template = Object.values(maps.flatViewFieldMaps.byUniversalIdentifier)
      .filter(isDefined)
      .find((field) => field.fieldMetadataId === maps.group.id)!;
    const oldColumns = maps.targets.slice(0, 2).map((target, index) => ({
      ...template,
      id: `column-${index}`,
      universalIdentifier: `column-universal-${index}`,
      fieldMetadataId: target.id,
      fieldMetadataUniversalIdentifier: target.universalIdentifier,
      position: 4 + index,
      size: 321,
      isVisible: false,
      isSystemSideEffect: false,
    }));
    const operations = buildMorphFieldReferenceUpdates({
      ...maps,
      flatViewFieldMaps: createMaps(oldColumns),
      direction: 'up',
    });
    expect(operations.viewField?.flatEntityToUpdate).toEqual([
      expect.objectContaining({
        universalIdentifier: oldColumns[0].universalIdentifier,
        fieldMetadataUniversalIdentifier: maps.group.universalIdentifier,
        position: 4,
        size: 321,
        isVisible: false,
      }),
    ]);
    expect(operations.viewField?.flatEntityToDelete).toEqual([oldColumns[1]]);
  });

  it('uses the canonical identity when moving an engine-owned column', () => {
    const maps = fixture();
    const template = Object.values(maps.flatViewFieldMaps.byUniversalIdentifier)
      .filter(isDefined)
      .find((field) => field.fieldMetadataId === maps.group.id)!;
    const oldColumn = {
      ...template,
      universalIdentifier: 'old-column',
      fieldMetadataId: maps.targets[0].id,
      fieldMetadataUniversalIdentifier: maps.targets[0].universalIdentifier,
      isSystemSideEffect: true,
      size: 321,
    };
    const operations = buildMorphFieldReferenceUpdates({
      ...maps,
      flatViewFieldMaps: createMaps([oldColumn]),
      direction: 'up',
    });
    expect(operations.viewField?.flatEntityToDelete).toEqual([oldColumn]);
    expect(operations.viewField?.flatEntityToCreate).toEqual([
      expect.objectContaining({
        fieldMetadataUniversalIdentifier: maps.group.universalIdentifier,
        size: 321,
        universalIdentifier: getSystemViewFieldUniversalIdentifier({
          fieldMetadataApplicationUniversalIdentifier:
            maps.group.applicationUniversalIdentifier,
          fieldMetadataUniversalIdentifier: maps.group.universalIdentifier,
          viewUniversalIdentifier: template.viewUniversalIdentifier,
        }),
      }),
    ]);
  });

  it('merges target restrictions without weakening either restriction', () => {
    const maps = fixture();
    const permissions = maps.targets.slice(0, 2).map((target, index) => ({
      id: `permission-${index}`,
      universalIdentifier: `permission-universal-${index}`,
      applicationId: maps.group.applicationId,
      applicationUniversalIdentifier: maps.group.applicationUniversalIdentifier,
      workspaceId: maps.group.workspaceId,
      roleId: 'role',
      roleUniversalIdentifier: 'role-universal',
      objectMetadataId: maps.object.id,
      objectMetadataUniversalIdentifier: maps.object.universalIdentifier,
      fieldMetadataId: target.id,
      fieldMetadataUniversalIdentifier: target.universalIdentifier,
      canReadFieldValue: index === 0 ? false : null,
      canUpdateFieldValue: index === 1 ? false : null,
      createdAt: maps.group.createdAt,
      updatedAt: maps.group.updatedAt,
    }));
    const operations = buildMorphFieldReferenceUpdates({
      ...maps,
      flatFieldPermissionMaps: createMaps(permissions),
      direction: 'up',
    });
    expect(operations.fieldPermission?.flatEntityToUpdate).toEqual([
      expect.objectContaining({
        fieldMetadataUniversalIdentifier: maps.group.universalIdentifier,
        canReadFieldValue: false,
        canUpdateFieldValue: false,
      }),
    ]);
    expect(operations.fieldPermission?.flatEntityToDelete).toEqual([
      permissions[1],
    ]);
    const groupPermission = {
      ...permissions[0],
      fieldMetadataId: maps.group.id,
      fieldMetadataUniversalIdentifier: maps.group.universalIdentifier,
      canUpdateFieldValue: false,
    };
    const restored = buildMorphFieldReferenceUpdates({
      ...maps,
      flatFieldPermissionMaps: createMaps([
        groupPermission,
        {
          ...permissions[1],
          canReadFieldValue: null,
          canUpdateFieldValue: null,
        },
      ]),
      direction: 'down',
    });
    const restoredPermissions = [
      ...(restored.fieldPermission?.flatEntityToCreate ?? []),
      ...(restored.fieldPermission?.flatEntityToUpdate ?? []),
    ];
    expect(
      restoredPermissions
        .map((permission) => permission.fieldMetadataUniversalIdentifier)
        .sort(),
    ).toEqual(maps.targets.map((target) => target.universalIdentifier).sort());
    for (const permission of restoredPermissions)
      expect(permission).toMatchObject({
        canReadFieldValue: false,
        canUpdateFieldValue: false,
      });
  });

  it('refuses a downgrade that would lose an empty morph field', () => {
    const maps = fixture();
    expect(() =>
      buildMorphFieldReferenceUpdates({
        ...maps,
        flatFieldMetadataMaps: createMaps(
          maps.fields.filter((field) => !maps.targets.includes(field)),
        ),
        direction: 'down',
      }),
    ).toThrow('without a target');
  });
  it('exports and imports an empty logical morph field without a physical target', () => {
    const { group } = fixture();
    const manifest = fromFlatFieldMetadataToFieldManifest({
      flatFieldMetadata: group,
    });
    const imported = fromFieldManifestToUniversalFlatFieldMetadata({
      fieldManifest: manifest,
      applicationUniversalIdentifier: group.applicationUniversalIdentifier,
      now: group.createdAt,
    });
    expect(imported).toMatchObject({
      universalIdentifier: group.universalIdentifier,
      morphId: group.morphId,
      name: group.name,
      relationTargetFieldMetadataUniversalIdentifier: null,
      relationTargetObjectMetadataUniversalIdentifier: null,
    });
  });

  it('materializes owners for legacy manifests once and retains them after the original target is removed', () => {
    const maps = fixture();
    const manifestMaps = {
      ...createEmptyAllFlatEntityMaps(),
      ...maps,
      flatFieldMetadataMaps: createMaps(
        maps.fields.filter((field) => !isMorphRelationGroup(field)),
      ),
    };
    addMorphFieldsForLegacyManifest({
      manifestMaps,
      existingMaps: createEmptyAllFlatEntityMaps(),
    });
    expect(
      manifestMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        maps.group.universalIdentifier
      ],
    ).toMatchObject({
      name: 'target',
      universalIdentifier: maps.group.universalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier: null,
    });
    const renamedGroup = {
      ...maps.group,
      name: 'renamedGroup',
      label: 'Renamed group',
    };
    const existingMaps = {
      ...createEmptyAllFlatEntityMaps(),
      ...maps,
      flatFieldMetadataMaps: createMaps([
        ...maps.fields.filter((field) => field.id !== maps.group.id),
        renamedGroup,
      ]),
    };
    const laterManifest = {
      ...createEmptyAllFlatEntityMaps(),
      ...maps,
      flatFieldMetadataMaps: createMaps(maps.targets.slice(1)),
    };
    addMorphFieldsForLegacyManifest({
      manifestMaps: laterManifest,
      existingMaps,
    });
    expect(
      laterManifest.flatFieldMetadataMaps.byUniversalIdentifier[
        maps.group.universalIdentifier
      ],
    ).toEqual(renamedGroup);
  });

  it.each([false, true])(
    'allows missing owners only for internal standard migrations (system build: %s)',
    (isSystemBuild) => {
      const maps = fixture();
      const target = maps.targets[0];
      if (!isFlatFieldMetadataOfType(target, FieldMetadataType.MORPH_RELATION))
        throw new Error('Expected morph target');
      const errors = validateMorphRelationFlatFieldMetadata({
        flatEntityToValidate: target,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          ...maps,
          flatFieldMetadataMaps: createMaps(
            maps.fields.filter((field) => !isMorphRelationGroup(field)),
          ),
        },
        remainingFlatEntityMapsToValidate: createEmptyFlatEntityMaps(),
        additionalCacheDataMaps: {
          featureFlagsMap: {} as Record<FeatureFlagKey, boolean>,
        },
        workspaceId: maps.group.workspaceId,
        buildOptions: {
          isSystemBuild,
          applicationUniversalIdentifier:
            maps.group.applicationUniversalIdentifier,
        },
      });
      expect(
        errors.some(
          (error) =>
            error.message ===
            'Morph target must belong to a persisted morph field on the same object',
        ),
      ).toBe(!isSystemBuild);
    },
  );

  it('refuses incomplete metadata until the owner backfill finishes', () => {
    const { fields, group } = fixture();
    expect(() =>
      filterMorphRelationTargetFields(
        fields.filter((field) => field.id !== group.id),
      ),
    ).toThrow('Workspace metadata upgrade is still pending');
    expect(filterMorphRelationTargetFields(fields)).toContain(group);
    expect(filterMorphRelationTargetFields([group])).toEqual([group]);
  });

  it('rejects an index on the logical field while indexing physical targets', () => {
    const { group, targets, flatFieldMetadataMaps } = fixture();
    const compute = (fieldMetadataId: string) =>
      computeFlatIndexFieldColumnNames({
        flatFieldMetadataMaps,
        flatIndexFieldMetadatas: [
          {
            fieldMetadataId,
            indexMetadataId: 'index',
            order: 0,
            subFieldName: null,
            id: 'index-field',
            workspaceId: group.workspaceId,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
          },
        ],
      });
    expect(() => compute(group.id)).toThrow(
      'Cannot index a relation field that has no join column',
    );
    expect(compute(targets[0].id)).toEqual([`${targets[0].name}Id`]);
  });

  it.each([false, true])(
    'keeps legacy saved columns when importing targets on existing objects (existing owner: %s)',
    async (hasExistingOwner) => {
      const maps = fixture();
      const module = await Test.createTestingModule({
        providers: [
          ComputeApplicationManifestAllUniversalFlatEntityMapsService,
          { provide: SecretEncryptionService, useValue: {} },
        ],
      }).compile();
      const service = module.get(
        ComputeApplicationManifestAllUniversalFlatEntityMapsService,
      );
      const owner = { ...maps.group, name: 'renamedTarget' };
      const existingAllFlatEntityMaps = {
        ...createEmptyAllFlatEntityMaps(),
        ...maps,
        flatFieldMetadataMaps: createMaps(
          maps.fields
            .filter((field) => !isMorphRelationGroup(field))
            .concat(hasExistingOwner ? [owner] : []),
        ),
      };
      const columns = maps.targets.map((target, index) => ({
        universalIdentifier: `column-${index}`,
        fieldMetadataUniversalIdentifier: target.universalIdentifier,
        viewUniversalIdentifier: 'view',
        position: index,
        isVisible: true,
        size: 150,
      }));
      const manifest = buildBaseManifest({
        appId: maps.group.applicationUniversalIdentifier,
        roleId: 'role',
        overrides: {
          fields: maps.targets.map((flatFieldMetadata) =>
            fromFlatFieldMetadataToFieldManifest({ flatFieldMetadata }),
          ),
          viewFields: columns,
        },
      });
      const result = service.compute({
        manifest,
        ownerFlatApplication: {
          universalIdentifier: maps.group.applicationUniversalIdentifier,
          sourceType: ApplicationRegistrationSourceType.LOCAL,
        },
        fromAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
        existingAllFlatEntityMaps,
        now: maps.group.createdAt,
        workspaceId: maps.group.workspaceId,
      });
      for (const column of columns) {
        expect(
          result.flatViewFieldMaps.byUniversalIdentifier[
            column.universalIdentifier
          ]?.fieldMetadataUniversalIdentifier,
        ).toBe(maps.group.universalIdentifier);
      }
      expect(
        result.flatFieldMetadataMaps.byUniversalIdentifier[
          maps.group.universalIdentifier
        ]?.name,
      ).toBe(hasExistingOwner ? owner.name : 'target');
      await module.close();
    },
  );

  it('creates form inputs for logical morph fields rather than physical targets', () => {
    const { group, targets } = fixture();
    expect(
      isFlatFieldMetadataEligibleForRecordForm({
        ...group,
        isSystem: false,
        isUIEditable: true,
      }),
    ).toBe(true);
    for (const target of targets)
      expect(
        isFlatFieldMetadataEligibleForRecordForm({
          ...target,
          isSystem: false,
          isUIEditable: true,
        }),
      ).toBe(false);
  });

  it('migrates duplicate target form inputs to one logical field input', () => {
    const maps = fixture();
    const template = Object.values(
      maps.flatPageLayoutWidgetMaps.byUniversalIdentifier,
    ).filter(isDefined)[0];
    const widgets = maps.targets.slice(0, 2).map((target, index) => ({
      ...template,
      id: `widget-${index}`,
      universalIdentifier: `widget-universal-${index}`,
      isSystemSideEffect: true,
      universalConfiguration: {
        configurationType: WidgetConfigurationType.FORM_FIELD as const,
        fieldMetadataId: target.universalIdentifier,
      },
    }));
    const operations = buildMorphFieldReferenceUpdates({
      ...maps,
      flatPageLayoutWidgetMaps: createMaps(widgets),
      direction: 'up',
    });
    expect(operations.pageLayoutWidget?.flatEntityToDelete).toHaveLength(2);
    expect(operations.pageLayoutWidget?.flatEntityToCreate).toEqual([
      expect.objectContaining({
        universalConfiguration: {
          configurationType: WidgetConfigurationType.FORM_FIELD,
          fieldMetadataId: maps.group.universalIdentifier,
        },
      }),
    ]);
  });
});
