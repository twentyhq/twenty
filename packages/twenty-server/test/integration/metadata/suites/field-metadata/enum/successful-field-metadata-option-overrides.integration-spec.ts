import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { type FieldMetadataComplexOption } from 'twenty-shared/types';
import { findOrThrow, isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type StoredOption = FieldMetadataComplexOption & { id: string };

type OptionRow = {
  universalIdentifier: string;
  value: string;
  label: string;
  color: string | null;
  position: number;
  isActive: boolean;
  overrides: Record<string, object> | null;
  isOwnedByWorkspace: boolean;
};

const findStageField = async (): Promise<{
  id: string;
  options: StoredOption[];
  workspaceCustomApplicationUniversalIdentifier: string;
}> => {
  const [stageField] = await globalThis.testDataSource.query(
    `SELECT field.id, field.options,
        application."universalIdentifier" AS "workspaceCustomApplicationUniversalIdentifier"
      FROM core."fieldMetadata" field
      JOIN core."objectMetadata" object ON object.id = field."objectMetadataId"
      JOIN core.workspace workspace ON workspace.id = field."workspaceId"
      JOIN core.application application ON application.id = workspace."workspaceCustomApplicationId"
      WHERE field."workspaceId" = $1 AND object."nameSingular" = 'opportunity' AND field.name = 'stage'`,
    [SEED_APPLE_WORKSPACE_ID],
  );

  return stageField;
};

const findOptionRows = async (fieldMetadataId: string): Promise<OptionRow[]> =>
  globalThis.testDataSource.query(
    `SELECT option."universalIdentifier", option.value, option.label, option.color, option.position,
        option."isActive", option.overrides,
        option."applicationId" = workspace."workspaceCustomApplicationId" AS "isOwnedByWorkspace"
      FROM core."fieldMetadataOption" option
      JOIN core.workspace workspace ON workspace.id = option."workspaceId"
      WHERE option."fieldMetadataId" = $1 ORDER BY option.value`,
    [fieldMetadataId],
  );

const updateStageOptions = ({
  fieldMetadataId,
  options,
  expectToFail,
}: {
  fieldMetadataId: string;
  options: FieldMetadataComplexOption[];
  expectToFail: boolean;
}) =>
  updateOneFieldMetadata<{ id: string; options: StoredOption[] }>({
    expectToFail,
    input: { idToUpdate: fieldMetadataId, updatePayload: { options } },
    gqlFields: 'id options',
  });

describe('a workspace overrides the options of a standard field', () => {
  let fieldMetadataId: string;
  let originalOptions: StoredOption[];
  let workspaceCustomApplicationUniversalIdentifier: string;

  beforeAll(async () => {
    const stageField = await findStageField();

    fieldMetadataId = stageField.id;
    originalOptions = stageField.options;
    workspaceCustomApplicationUniversalIdentifier =
      stageField.workspaceCustomApplicationUniversalIdentifier;
  });

  afterAll(async () => {
    await updateStageOptions({
      fieldMetadataId,
      options: originalOptions,
      expectToFail: false,
    });

    expect(
      (await findOptionRows(fieldMetadataId)).every(
        ({ overrides, isOwnedByWorkspace }) =>
          overrides === null && !isOwnedByWorkspace,
      ),
    ).toBe(true);
  });

  it('stores edits sent without ids as overrides and keeps the standard rows', async () => {
    const originalRows = await findOptionRows(fieldMetadataId);
    const screeningOption = originalOptions.find(
      ({ value }) => value === 'SCREENING',
    );
    const meetingOption = findOrThrow(
      originalOptions,
      ({ value }) => value === 'MEETING',
    );
    const otherOptions = originalOptions.filter(
      ({ value }) => value !== 'SCREENING' && value !== 'MEETING',
    );

    const { data } = await updateStageOptions({
      fieldMetadataId,
      expectToFail: false,
      options: [
        ...otherOptions.map(({ value, label, color }, position) => ({
          value,
          label,
          color,
          position,
        })),
        {
          value: 'SCREENING',
          label: 'Qualifying',
          color: 'blue',
          position: otherOptions.length,
        },
        {
          value: 'ON_HOLD',
          label: 'On hold',
          color: 'gray',
          position: otherOptions.length + 1,
        },
        {
          value: 'MEETING',
          label: 'Meeting',
          color: meetingOption.color,
          position: otherOptions.length + 2,
          isActive: false,
        },
      ],
    });

    const updatedOptions = data.updateOneField.options;

    expect(
      updatedOptions
        .filter(({ value }) => value !== 'ON_HOLD')
        .map(({ id }) => id)
        .sort(),
    ).toEqual(originalOptions.map(({ id }) => id).sort());
    // The owner is derived from the option rows when the field is read, and never stored.
    expect(
      updatedOptions.map(({ value, applicationId, isActive }) => ({
        value,
        hasOtherOwnerThanField: isDefined(applicationId),
        isActive,
      })),
    ).toEqual([
      ...otherOptions.map(({ value }) => ({
        value,
        hasOtherOwnerThanField: false,
      })),
      { value: 'SCREENING', hasOtherOwnerThanField: false },
      { value: 'ON_HOLD', hasOtherOwnerThanField: true },
      { value: 'MEETING', hasOtherOwnerThanField: false, isActive: false },
    ]);
    expect(
      (await findStageField()).options.some(
        (option) => 'applicationId' in option,
      ),
    ).toBe(false);

    const updatedRows = await findOptionRows(fieldMetadataId);
    const findRow = ({ rows, value }: { rows: OptionRow[]; value: string }) =>
      rows.find((row) => row.value === value);

    expect(findRow({ rows: updatedRows, value: 'SCREENING' })).toEqual({
      ...findRow({ rows: originalRows, value: 'SCREENING' }),
      overrides: {
        [workspaceCustomApplicationUniversalIdentifier]: {
          label: 'Qualifying',
          color: 'blue',
          position: otherOptions.length,
        },
      },
    });
    expect(findRow({ rows: updatedRows, value: 'MEETING' })).toEqual({
      ...findRow({ rows: originalRows, value: 'MEETING' }),
      overrides: {
        [workspaceCustomApplicationUniversalIdentifier]: {
          isActive: false,
          position: otherOptions.length + 2,
        },
      },
    });
    expect(findRow({ rows: updatedRows, value: 'ON_HOLD' })).toMatchObject({
      label: 'On hold',
      isActive: true,
      overrides: null,
      isOwnedByWorkspace: true,
    });
    expect(screeningOption).toBeDefined();
  });

  it('refuses to remove or re-value a standard option, and removes the workspace one', async () => {
    const { options: currentOptions } = await findStageField();

    const { errors: removalErrors } = await updateStageOptions({
      fieldMetadataId,
      expectToFail: true,
      options: currentOptions
        .filter(({ value }) => value !== 'SCREENING')
        .map((option, position) => ({ ...option, position })),
    });

    expect(removalErrors[0].extensions.userFriendlyMessage).toBe(
      'Option "Qualifying" comes with the field and cannot be removed. Deactivate it instead.',
    );

    const { errors: valueErrors } = await updateStageOptions({
      fieldMetadataId,
      expectToFail: true,
      options: currentOptions.map((option) =>
        option.value === 'SCREENING'
          ? { ...option, value: 'QUALIFYING' }
          : option,
      ),
    });

    expect(valueErrors[0].extensions.userFriendlyMessage).toBe(
      'The API value of option "Qualifying" comes with the field and cannot be changed.',
    );

    const { data } = await updateStageOptions({
      fieldMetadataId,
      expectToFail: false,
      options: currentOptions
        .filter(({ value }) => value !== 'ON_HOLD')
        .map((option, position) => ({ ...option, position })),
    });

    expect(
      data.updateOneField.options.some(({ value }) => value === 'ON_HOLD'),
    ).toBe(false);
    expect(
      (await findOptionRows(fieldMetadataId)).some(
        ({ value }) => value === 'ON_HOLD',
      ),
    ).toBe(false);
  });

  it('refuses to deactivate the default option', async () => {
    const { options: currentOptions } = await findStageField();

    const { errors } = await updateStageOptions({
      fieldMetadataId,
      expectToFail: true,
      options: currentOptions.map((option) =>
        option.value === 'NEW' ? { ...option, isActive: false } : option,
      ),
    });

    expect(JSON.stringify(errors)).toContain(
      'The default option cannot be deactivated',
    );
  });
});
