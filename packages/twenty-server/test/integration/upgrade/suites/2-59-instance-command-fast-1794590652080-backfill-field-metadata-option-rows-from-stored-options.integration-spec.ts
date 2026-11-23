import { Test } from '@nestjs/testing';

import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { BackfillFieldMetadataOptionRowsFromStoredOptionsFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-59/2-59-instance-command-fast-1794590652080-backfill-field-metadata-option-rows-from-stored-options';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

type OptionRow = {
  universalIdentifier: string;
  applicationId: string;
  value: string;
  label: string;
};

describe('2-59 fast instance command 1794590652080 - BackfillFieldMetadataOptionRowsFromStoredOptionsFastInstanceCommand (integration)', () => {
  const flush = jest.fn();
  let command: BackfillFieldMetadataOptionRowsFromStoredOptionsFastInstanceCommand;
  let queryRunner: QueryRunner;
  let stageField: {
    id: string;
    applicationId: string;
    workspaceCustomApplicationId: string;
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BackfillFieldMetadataOptionRowsFromStoredOptionsFastInstanceCommand,
        { provide: WorkspaceCacheService, useValue: { flush } },
      ],
    }).compile();

    command = module.get(
      BackfillFieldMetadataOptionRowsFromStoredOptionsFastInstanceCommand,
    );
  });

  const findStageOptionRows = async (): Promise<OptionRow[]> =>
    queryRunner.query(
      `SELECT "universalIdentifier", "applicationId", value, label
        FROM core."fieldMetadataOption" WHERE "fieldMetadataId" = $1 ORDER BY value`,
      [stageField.id],
    );

  const findStageOptionRow = async (value: string) =>
    (await findStageOptionRows()).find((row) => row.value === value);

  beforeEach(async () => {
    flush.mockReset();
    queryRunner =
      global.workflowTestServices.coreDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    [stageField] = await queryRunner.query(
      `SELECT field.id, field."applicationId", workspace."workspaceCustomApplicationId"
        FROM core."fieldMetadata" AS field
          JOIN core."objectMetadata" AS object ON object.id = field."objectMetadataId"
          JOIN core.application AS application ON application.id = field."applicationId"
          JOIN core.workspace AS workspace ON workspace.id = field."workspaceId"
        WHERE field."workspaceId" = $1 AND object."nameSingular" = 'opportunity'
          AND field.name = 'stage' AND application."universalIdentifier" = $2`,
      [
        SEED_APPLE_WORKSPACE_ID,
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      ],
    );
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('recreates a missing stored option row with its option id and the field application', async () => {
    const [{ options }]: { options: { id: string; value: string }[] }[] =
      await queryRunner.query(
        `SELECT options FROM core."fieldMetadata" WHERE id = $1`,
        [stageField.id],
      );
    const [missingOption, editedOption] = options;

    await queryRunner.query(
      `DELETE FROM core."fieldMetadataOption" WHERE "fieldMetadataId" = $1 AND value = $2`,
      [stageField.id, missingOption.value],
    );
    await queryRunner.query(
      `UPDATE core."fieldMetadataOption" SET label = 'Edited on the row'
        WHERE "fieldMetadataId" = $1 AND value = $2`,
      [stageField.id, editedOption.value],
    );

    await command.up(queryRunner);

    expect(await findStageOptionRow(missingOption.value)).toMatchObject({
      universalIdentifier: missingOption.id,
      applicationId: stageField.applicationId,
    });
    expect(await findStageOptionRow(editedOption.value)).toMatchObject({
      label: 'Edited on the row',
    });
    expect(flush).toHaveBeenCalledWith(
      SEED_APPLE_WORKSPACE_ID,
      expect.arrayContaining(['flatFieldMetadataOptionMaps']),
    );
  });

  it('gives the workspace application the options a workspace added to a standard field', async () => {
    const addedOptionId = v4();

    await queryRunner.query(
      `UPDATE core."fieldMetadata"
        SET options = options || $2::jsonb WHERE id = $1`,
      [
        stageField.id,
        JSON.stringify([
          {
            id: addedOptionId,
            value: 'WORKSPACE_ADDED',
            label: 'Workspace added',
            color: 'blue',
            position: 99,
          },
          {
            id: v4(),
            value: 'WORKSPACE_ADDED_WITH_ROW',
            label: 'Workspace added with row',
            position: 100,
          },
        ]),
      ],
    );
    await queryRunner.query(
      `INSERT INTO core."fieldMetadataOption"
          ("workspaceId", "universalIdentifier", "applicationId", "fieldMetadataId", value, label, position)
        VALUES ($1, $2, $3, $4, 'WORKSPACE_ADDED_WITH_ROW', 'Workspace added with row', 100)`,
      [SEED_APPLE_WORKSPACE_ID, v4(), stageField.applicationId, stageField.id],
    );
    const rowsBefore = await findStageOptionRows();

    await command.up(queryRunner);

    expect(await findStageOptionRow('WORKSPACE_ADDED')).toMatchObject({
      universalIdentifier: addedOptionId,
      applicationId: stageField.workspaceCustomApplicationId,
    });
    expect(await findStageOptionRow('WORKSPACE_ADDED_WITH_ROW')).toMatchObject({
      applicationId: stageField.workspaceCustomApplicationId,
    });

    const standardRowsAfter = (await findStageOptionRows()).filter(
      ({ value }) => !value.startsWith('WORKSPACE_ADDED'),
    );

    expect(standardRowsAfter).toEqual(
      rowsBefore.filter(({ value }) => !value.startsWith('WORKSPACE_ADDED')),
    );
  });

  it('does not reuse an option id another row of the workspace holds', async () => {
    const [{ universalIdentifier: takenOptionId }]: OptionRow[] =
      await findStageOptionRows();

    await queryRunner.query(
      `UPDATE core."fieldMetadata"
        SET options = options || $2::jsonb WHERE id = $1`,
      [
        stageField.id,
        JSON.stringify([
          { id: takenOptionId, value: 'DUPLICATE_ID', label: 'Duplicate id' },
        ]),
      ],
    );

    await command.up(queryRunner);

    const duplicateIdRow = await findStageOptionRow('DUPLICATE_ID');

    expect(duplicateIdRow).toBeDefined();
    expect(duplicateIdRow?.universalIdentifier).not.toBe(takenOptionId);
  });
});
