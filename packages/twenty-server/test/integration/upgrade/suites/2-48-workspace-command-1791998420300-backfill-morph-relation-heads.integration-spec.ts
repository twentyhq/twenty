import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { type BackfillMorphRelationHeadsCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791998420300-backfill-morph-relation-heads.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const NOTE_TARGET_MORPH_ID =
  STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId;

describe('2-48 workspace command - backfill morph relation heads (integration)', () => {
  let command: BackfillMorphRelationHeadsCommand;
  let workspaceCacheService: WorkspaceCacheService;
  let createdObjectMetadataIds: string[] = [];
  let customMorphId: string;
  let relationBeforeDown: Awaited<ReturnType<typeof findMorphRelation>>;

  const findHeads = async () => {
    const { flatFieldMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
      ]);

    return Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(isMorphRelationHead);
  };

  const findMorphRelation = async (morphId: string) => {
    const { flatFieldMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
      ]);

    const targets = Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (field) => field.morphId === morphId && !isMorphRelationHead(field),
      );

    const joinColumns: { column_name: string }[] =
      await global.testDataSource.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = $1 AND column_name LIKE 'ownerHeadBackfill%'
         ORDER BY column_name`,
        [getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)],
      );

    return {
      targets: targets
        .map(({ id, name, relationTargetFieldMetadataId }) => ({
          id,
          name,
          inverse: isDefined(relationTargetFieldMetadataId)
            ? flatFieldMetadataMaps.byUniversalIdentifier[
                flatFieldMetadataMaps.universalIdentifierById[
                  relationTargetFieldMetadataId
                ] ?? ''
              ]?.name
            : undefined,
        }))
        .sort((first, second) => first.name.localeCompare(second.name)),
      joinColumns: joinColumns.map(({ column_name }) => column_name),
    };
  };

  const findHead = async (morphId: string) =>
    (await findHeads()).find((head) => head.universalIdentifier === morphId);

  const createObject = async (nameSingular: string, namePlural: string) => {
    const {
      data: {
        createOneObject: { id },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular,
        namePlural,
        labelSingular: nameSingular,
        labelPlural: namePlural,
        icon: 'IconBox',
      },
    });

    createdObjectMetadataIds.push(id);

    return id;
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<BackfillMorphRelationHeadsCommand>(
      'BackfillMorphRelationHeadsCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    const sourceObjectId = await createObject(
      'headBackfillSource',
      'headBackfillSources',
    );
    const firstTargetObjectId = await createObject(
      'headBackfillPet',
      'headBackfillPets',
    );
    const secondTargetObjectId = await createObject(
      'headBackfillToy',
      'headBackfillToys',
    );

    const { data } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'owner',
        label: 'Owner',
        objectMetadataId: sourceObjectId,
        type: FieldMetadataType.MORPH_RELATION,
        morphRelationsCreationPayload: [
          {
            targetObjectMetadataId: firstTargetObjectId,
            targetFieldLabel: 'Owned source',
            targetFieldIcon: 'IconBox',
            type: RelationType.MANY_TO_ONE,
          },
          {
            targetObjectMetadataId: secondTargetObjectId,
            targetFieldLabel: 'Owned source',
            targetFieldIcon: 'IconBox',
            type: RelationType.MANY_TO_ONE,
          },
        ],
      },
      gqlFields: 'id morphId',
    });

    customMorphId = data.createOneField.morphId as string;
  });

  afterAll(async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);

    for (const objectMetadataId of createdObjectMetadataIds) {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: objectMetadataId,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: objectMetadataId },
      });
    }

    createdObjectMetadataIds = [];
  });

  it('removes every head on down', async () => {
    expect(await findHead(NOTE_TARGET_MORPH_ID)).toBeDefined();
    expect(await findHead(customMorphId)).toBeDefined();

    relationBeforeDown = await findMorphRelation(customMorphId);

    expect(relationBeforeDown.targets).toHaveLength(2);
    expect(
      relationBeforeDown.targets.every(({ inverse }) => isDefined(inverse)),
    ).toBe(true);
    expect(relationBeforeDown.joinColumns).toEqual([
      'ownerHeadBackfillPetId',
      'ownerHeadBackfillToyId',
    ]);

    await command.down(RUN_ON_WORKSPACE_ARGS);

    expect(await findHeads()).toEqual([]);
    expect(await findMorphRelation(customMorphId)).toEqual(relationBeforeDown);
  });

  it('recreates the standard and custom heads on up', async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await findHead(NOTE_TARGET_MORPH_ID)).toMatchObject({
      name: 'target',
      morphId: NOTE_TARGET_MORPH_ID,
      isSystemSideEffect: true,
      relationTargetObjectMetadataId: null,
      relationTargetFieldMetadataId: null,
    });

    const customHead = await findHead(customMorphId);

    expect(customHead).toMatchObject({
      name: 'owner',
      label: 'Owner',
      morphId: customMorphId,
      isSystemSideEffect: true,
      relationTargetObjectMetadataId: null,
      relationTargetFieldMetadataId: null,
    });
    expect(customHead?.universalSettings).not.toHaveProperty('joinColumnName');
    expect(await findMorphRelation(customMorphId)).toEqual(relationBeforeDown);
  });

  it('changes nothing when it runs again', async () => {
    const headIdsBefore = (await findHeads()).map(({ id }) => id).sort();

    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect((await findHeads()).map(({ id }) => id).sort()).toEqual(
      headIdsBefore,
    );
  });
});
