import { type AllMetadataName } from 'twenty-shared/metadata';

import { type WorkspaceMigrationActionType } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { sortFailedFlatEntityValidations } from 'src/engine/workspace-manager/workspace-migration/utils/sort-failed-flat-entity-validations.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

const buildFailedValidation = (
  name?: string,
): FailedFlatEntityValidation<
  AllMetadataName,
  WorkspaceMigrationActionType
> => ({
  type: 'create',
  metadataName: 'fieldMetadata',
  errors: [],
  flatEntityMinimalInformation: name === undefined ? {} : { name },
});

describe('sortFailedFlatEntityValidations', () => {
  it('should sort failed validations by entity name regardless of input order', () => {
    const sorted = sortFailedFlatEntityValidations([
      buildFailedValidation('updatedAt'),
      buildFailedValidation('createdAt'),
      buildFailedValidation('searchVector'),
    ]);

    expect(
      sorted.map(
        (failedValidation) => failedValidation.flatEntityMinimalInformation,
      ),
    ).toEqual([
      { name: 'createdAt' },
      { name: 'searchVector' },
      { name: 'updatedAt' },
    ]);
  });

  it('should place failed validations without a name first and keep their relative order', () => {
    const firstNameless = buildFailedValidation();
    const secondNameless = buildFailedValidation();

    const sorted = sortFailedFlatEntityValidations([
      buildFailedValidation('createdAt'),
      firstNameless,
      secondNameless,
    ]);

    expect(sorted[0]).toBe(firstNameless);
    expect(sorted[1]).toBe(secondNameless);
    expect(sorted[2].flatEntityMinimalInformation).toEqual({
      name: 'createdAt',
    });
  });

  it('should not mutate the input array', () => {
    const input = [
      buildFailedValidation('updatedAt'),
      buildFailedValidation('createdAt'),
    ];

    sortFailedFlatEntityValidations(input);

    expect(input[0].flatEntityMinimalInformation).toEqual({
      name: 'updatedAt',
    });
  });
});
