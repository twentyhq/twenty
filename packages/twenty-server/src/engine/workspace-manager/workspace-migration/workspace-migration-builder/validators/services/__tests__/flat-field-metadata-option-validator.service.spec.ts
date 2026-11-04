import { FeatureFlagKey, FieldMetadataType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { FieldMetadataOptionExceptionCode } from 'src/engine/metadata-modules/field-metadata-option/field-metadata-option.exception';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadataOption } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata-option.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';
import { FlatFieldMetadataOptionValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-field-metadata-option-validator.service';

const WORKSPACE_ID = v4();
const APPLICATION_UNIVERSAL_IDENTIFIER = v4();
const now = new Date().toISOString();

const SELECT_FIELD = getFlatFieldMetadataMock({
  universalIdentifier: v4(),
  objectMetadataId: v4(),
  type: FieldMetadataType.SELECT,
});

const TEXT_FIELD = getFlatFieldMetadataMock({
  universalIdentifier: v4(),
  objectMetadataId: v4(),
  type: FieldMetadataType.TEXT,
});

const buildOption = (
  overrides: Partial<UniversalFlatFieldMetadataOption> = {},
): UniversalFlatFieldMetadataOption => ({
  universalIdentifier: v4(),
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: SELECT_FIELD.universalIdentifier,
  value: 'OPTION_A',
  label: 'Option A',
  color: 'blue',
  position: 0,
  isActive: true,
  overrides: null,
  createdAt: now,
  updatedAt: now,
  ...overrides,
});

const buildFeatureFlagsMap =
  (): WorkspaceMigrationBuilderAdditionalCacheDataMaps['featureFlagsMap'] =>
    Object.values(FeatureFlagKey).reduce(
      (featureFlagsMap, key) => ({ ...featureFlagsMap, [key]: false }),
      {} as WorkspaceMigrationBuilderAdditionalCacheDataMaps['featureFlagsMap'],
    );

const buildCommonValidationArgs = ({
  fields = [SELECT_FIELD, TEXT_FIELD],
  existingOptions = [],
}: {
  fields?: FlatFieldMetadata[];
  existingOptions?: UniversalFlatFieldMetadataOption[];
}) => {
  const optimisticFlatEntityMapsAndRelatedFlatEntityMaps =
    createEmptyAllFlatEntityMaps();

  for (const field of fields) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: field,
      universalFlatEntityMapsToMutate:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatFieldMetadataMaps,
    });
  }

  for (const option of existingOptions) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: option,
      universalFlatEntityMapsToMutate:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatFieldMetadataOptionMaps,
    });
  }

  return {
    additionalCacheDataMaps: {
      featureFlagsMap: buildFeatureFlagsMap(),
      billingEntitlements: {},
    },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    workspaceId: WORKSPACE_ID,
    buildOptions: {
      isSystemBuild: false,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      workspaceCustomApplicationUniversalIdentifier:
        APPLICATION_UNIVERSAL_IDENTIFIER,
      flatApplicationMaps: { byId: {}, idByUniversalIdentifier: {} },
    },
  };
};

const buildOptionMaps = (
  options: UniversalFlatFieldMetadataOption[],
): MetadataUniversalFlatEntityMaps<'fieldMetadataOption'> => {
  const optionMaps = createEmptyFlatEntityMaps();

  for (const option of options) {
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: option,
      universalFlatEntityMapsToMutate: optionMaps,
    });
  }

  return optionMaps;
};

const errorCodes = (result: { errors: { code: string }[] }) =>
  result.errors.map(({ code }) => code);

describe('FlatFieldMetadataOptionValidatorService', () => {
  const validator = new FlatFieldMetadataOptionValidatorService();

  describe('creation', () => {
    const validate = ({
      option,
      fields,
      existingOptions = [],
    }: {
      option: UniversalFlatFieldMetadataOption;
      fields?: FlatFieldMetadata[];
      existingOptions?: UniversalFlatFieldMetadataOption[];
    }) =>
      validator.validateFlatFieldMetadataOptionCreation({
        ...buildCommonValidationArgs({ fields, existingOptions }),
        flatEntityToValidate: option,
        finalFlatEntityMaps: buildOptionMaps([option, ...existingOptions]),
        remainingFlatEntityMapsToValidate: createEmptyFlatEntityMaps(),
      });

    it('accepts a valid option on a select field', () => {
      expect(validate({ option: buildOption() }).errors).toEqual([]);
    });

    it('rejects an option whose field does not exist', () => {
      expect(
        errorCodes(
          validate({
            option: buildOption({ fieldMetadataUniversalIdentifier: v4() }),
          }),
        ),
      ).toEqual([
        FieldMetadataOptionExceptionCode.INVALID_FIELD_METADATA_OPTION_INPUT,
      ]);
    });

    it('rejects an option on a field that does not take options', () => {
      expect(
        errorCodes(
          validate({
            option: buildOption({
              fieldMetadataUniversalIdentifier: TEXT_FIELD.universalIdentifier,
            }),
          }),
        ),
      ).toEqual([
        FieldMetadataOptionExceptionCode.INVALID_FIELD_METADATA_OPTION_INPUT,
      ]);
    });

    it('rejects a value that is not UPPER_SNAKE_CASE', () => {
      expect(
        validate({ option: buildOption({ value: 'optionA' }) }).errors,
      ).not.toEqual([]);
    });

    it('rejects a label containing a comma', () => {
      expect(
        validate({ option: buildOption({ label: 'A, B' }) }).errors,
      ).not.toEqual([]);
    });

    it('rejects an unsupported color', () => {
      expect(
        validate({ option: buildOption({ color: 'not-a-color' }) }).errors,
      ).not.toEqual([]);
    });

    it('rejects a value already used by another option of the same field', () => {
      expect(
        errorCodes(
          validate({
            option: buildOption(),
            existingOptions: [buildOption()],
          }),
        ),
      ).toEqual([
        FieldMetadataOptionExceptionCode.INVALID_FIELD_METADATA_OPTION_INPUT,
      ]);
    });

    it('accepts a value used by an option of another field', () => {
      const otherSelectField = getFlatFieldMetadataMock({
        universalIdentifier: v4(),
        objectMetadataId: v4(),
        type: FieldMetadataType.SELECT,
      });

      expect(
        validate({
          option: buildOption(),
          fields: [SELECT_FIELD, otherSelectField],
          existingOptions: [
            buildOption({
              fieldMetadataUniversalIdentifier:
                otherSelectField.universalIdentifier,
            }),
          ],
        }).errors,
      ).toEqual([]);
    });
  });

  describe('update', () => {
    const validate = ({
      existingOptions,
      universalIdentifier,
      flatEntityUpdate,
      finalOptions = existingOptions.map((option) =>
        option.universalIdentifier === universalIdentifier
          ? { ...option, ...flatEntityUpdate }
          : option,
      ),
    }: {
      existingOptions: UniversalFlatFieldMetadataOption[];
      universalIdentifier: string;
      flatEntityUpdate: Partial<UniversalFlatFieldMetadataOption>;
      finalOptions?: UniversalFlatFieldMetadataOption[];
    }) =>
      validator.validateFlatFieldMetadataOptionUpdate({
        ...buildCommonValidationArgs({ existingOptions }),
        universalIdentifier,
        flatEntityUpdate,
        finalFlatEntityMaps: buildOptionMaps(finalOptions),
      });

    it('accepts a new value that no other option uses', () => {
      const option = buildOption();

      expect(
        validate({
          existingOptions: [option],
          universalIdentifier: option.universalIdentifier,
          flatEntityUpdate: { value: 'OPTION_B' },
        }).errors,
      ).toEqual([]);
    });

    it('rejects a value already used by a sibling option', () => {
      const option = buildOption();
      const siblingOption = buildOption({ value: 'OPTION_B', position: 1 });

      expect(
        errorCodes(
          validate({
            existingOptions: [option, siblingOption],
            universalIdentifier: option.universalIdentifier,
            flatEntityUpdate: { value: 'OPTION_B' },
          }),
        ),
      ).toEqual([
        FieldMetadataOptionExceptionCode.INVALID_FIELD_METADATA_OPTION_INPUT,
      ]);
    });

    it('accepts swapping values between two options in one migration', () => {
      const option = buildOption();
      const siblingOption = buildOption({ value: 'OPTION_B', position: 1 });

      expect(
        validate({
          existingOptions: [option, siblingOption],
          universalIdentifier: option.universalIdentifier,
          flatEntityUpdate: { value: 'OPTION_B' },
          finalOptions: [
            { ...option, value: 'OPTION_B' },
            { ...siblingOption, value: 'OPTION_A' },
          ],
        }).errors,
      ).toEqual([]);
    });

    it('rejects moving an option to another field', () => {
      const option = buildOption();

      expect(
        errorCodes(
          validate({
            existingOptions: [option],
            universalIdentifier: option.universalIdentifier,
            flatEntityUpdate: { fieldMetadataUniversalIdentifier: v4() },
          }),
        ),
      ).toEqual([
        FieldMetadataOptionExceptionCode.INVALID_FIELD_METADATA_OPTION_INPUT,
      ]);
    });

    it('rejects updating an option that does not exist', () => {
      expect(
        errorCodes(
          validate({
            existingOptions: [],
            universalIdentifier: v4(),
            flatEntityUpdate: { label: 'Renamed' },
          }),
        ),
      ).toEqual([
        FieldMetadataOptionExceptionCode.FIELD_METADATA_OPTION_NOT_FOUND,
      ]);
    });
  });

  describe('deletion', () => {
    it('rejects deleting an option that does not exist', () => {
      expect(
        errorCodes(
          validator.validateFlatFieldMetadataOptionDeletion({
            ...buildCommonValidationArgs({}),
            flatEntityToValidate: buildOption(),
            remainingFlatEntityMapsToValidate: createEmptyFlatEntityMaps(),
          }),
        ),
      ).toEqual([
        FieldMetadataOptionExceptionCode.FIELD_METADATA_OPTION_NOT_FOUND,
      ]);
    });
  });
});
