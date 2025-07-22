import { Injectable } from '@nestjs/common';

import isEmpty from 'lodash.isempty';
import { MAX_OPTIONS_TO_DISPLAY } from 'twenty-shared/constants';
import { isDefined, parseJson } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { settings } from 'src/engine/constants/settings';
import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { isSelectFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-select-field-metadata-type.util';
import { SelectOrMultiSelectFieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/utils/is-select-or-multi-select-field-metadata.util';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ViewFilterWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter.workspace-entity';
import { ViewGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-group.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

type Differences<T> = {
  created: T[];
  updated: { old: T; new: T }[];
  deleted: T[];
};

type GetOptionsDifferences = Differences<
  FieldMetadataDefaultOption | FieldMetadataComplexOption
>;

@Injectable()
export class FieldMetadataRelatedRecordsService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  public async updateRelatedViewGroups(
    oldFieldMetadata: SelectOrMultiSelectFieldMetadataEntity,
    newFieldMetadata: SelectOrMultiSelectFieldMetadataEntity,
  ): Promise<void> {
    // TODO legacy should support multi-select and rating ?
    if (
      !isSelectFieldMetadataType(newFieldMetadata.type) ||
      !isSelectFieldMetadataType(oldFieldMetadata.type)
    ) {
      return;
    }
    const views = await this.getFieldMetadataViewWithRelation(
      newFieldMetadata,
      'viewGroups',
    );

    const { created, updated, deleted } = this.getOptionsDifferences(
      oldFieldMetadata.options ?? [],
      newFieldMetadata.options ?? [],
    );

    const viewGroupRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewGroupWorkspaceEntity>(
        newFieldMetadata.workspaceId,
        'viewGroup',
      );

    for (const view of views) {
      if (view.viewGroups.length === 0) {
        continue;
      }
      const valuesToDelete = deleted.map((option) => option.value);

      if (valuesToDelete.length > 0) {
        await viewGroupRepository.delete({
          fieldMetadataId: newFieldMetadata.id,
          fieldValue: In(valuesToDelete),
        });
      }
      const maxPosition = this.getMaxPosition(view.viewGroups);

      const viewGroupsToCreate = created.map((option, index) =>
        viewGroupRepository.create({
          fieldMetadataId: newFieldMetadata.id,
          fieldValue: option.value,
          position: maxPosition + index,
          isVisible: true,
          viewId: view.id,
        }),
      );

      if (viewGroupsToCreate.length > 0) {
        await viewGroupRepository.insert(viewGroupsToCreate);
      }

      for (const { old: oldOption, new: newOption } of updated) {
        const existingViewGroup = view.viewGroups.find(
          (group) => group.fieldValue === oldOption.value,
        );

        if (!existingViewGroup) {
          throw new Error(
            `View group not found for option "${oldOption.value}" during update.`,
          );
        }

        await viewGroupRepository.update(
          { id: existingViewGroup.id },
          { fieldValue: newOption.value },
        );
      }

      await this.syncNoValueViewGroup(
        newFieldMetadata,
        view,
        viewGroupRepository,
      );
    }
  }

  private computeViewFilterDisplayValue(
    newViewFilterOptions: FieldMetadataDefaultOption[],
  ): string {
    if (newViewFilterOptions.length > MAX_OPTIONS_TO_DISPLAY) {
      return `${newViewFilterOptions.length} options`;
    }

    return newViewFilterOptions.map((option) => option.label).join(', ');
  }

  public async updateRelatedViewFilters(
    oldFieldMetadata: SelectOrMultiSelectFieldMetadataEntity,
    newFieldMetadata: SelectOrMultiSelectFieldMetadataEntity,
  ): Promise<void> {
    const views = await this.getFieldMetadataViewWithRelation(
      newFieldMetadata,
      'viewFilters',
    );

    const alsoCompareLabel = true;
    const {
      updated: updatedFieldMetadataOptions,
      deleted: deletedFieldMetadataOptions,
    } = this.getOptionsDifferences(
      oldFieldMetadata.options,
      newFieldMetadata.options,
      alsoCompareLabel,
    );

    if (
      updatedFieldMetadataOptions.length === 0 &&
      deletedFieldMetadataOptions.length === 0
    ) {
      return;
    }

    const viewFilterRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewFilterWorkspaceEntity>(
        newFieldMetadata.workspaceId,
        'viewFilter',
      );

    for (const filter of views) {
      if (filter.viewFilters.length === 0) {
        continue;
      }

      for (const viewFilter of filter.viewFilters) {
        const viewFilterValue = parseJson<string[]>(viewFilter.value);

        // Note below assertion could be removed after https://github.com/twentyhq/core-team-issues/issues/1009 completion
        if (!isDefined(viewFilterValue) || !Array.isArray(viewFilterValue)) {
          throw new FieldMetadataException(
            `Unexpected invalid view filter value for filter ${viewFilter.id}`,
            FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
          );
        }

        const viewFilterOptions = viewFilterValue
          .map((value) => {
            if (!isDefined(oldFieldMetadata.options)) {
              return undefined;
            }

            return oldFieldMetadata.options.find(
              (option) => option.value === value,
            );
          })
          .filter(isDefined);

        const afterDeleteViewFilterOptions = viewFilterOptions.filter(
          (viewFilterOption) =>
            !deletedFieldMetadataOptions.some(
              (option) => option.value === viewFilterOption.value,
            ),
        );

        if (afterDeleteViewFilterOptions.length === 0) {
          await viewFilterRepository.delete({ id: viewFilter.id });
          continue;
        }

        const afterUpdateAndDeleteViewFilterOptions =
          afterDeleteViewFilterOptions.map((viewFilterOption) => {
            const updatedOption = updatedFieldMetadataOptions.find(
              ({ old }) => viewFilterOption.value === old.value,
            );

            return isDefined(updatedOption)
              ? updatedOption.new
              : viewFilterOption;
          });

        const displayValue = this.computeViewFilterDisplayValue(
          afterUpdateAndDeleteViewFilterOptions,
        );
        const value = JSON.stringify(
          afterUpdateAndDeleteViewFilterOptions.map((option) => option.value),
        );

        await viewFilterRepository.update(
          { id: viewFilter.id },
          {
            value,
            displayValue,
          },
        );
      }
    }
  }

  async syncNoValueViewGroup(
    fieldMetadata: SelectOrMultiSelectFieldMetadataEntity,
    view: ViewWorkspaceEntity,
    viewGroupRepository: WorkspaceRepository<ViewGroupWorkspaceEntity>,
  ): Promise<void> {
    const noValueGroup = view.viewGroups.find(
      (group) => group.fieldValue === '',
    );

    if (fieldMetadata.isNullable && !noValueGroup) {
      const maxPosition = this.getMaxPosition(view.viewGroups);
      const newGroup = viewGroupRepository.create({
        fieldMetadataId: fieldMetadata.id,
        fieldValue: '',
        position: maxPosition + 1,
        isVisible: true,
        viewId: view.id,
      });

      await viewGroupRepository.insert(newGroup);
    } else if (!fieldMetadata.isNullable && noValueGroup) {
      await viewGroupRepository.delete({ id: noValueGroup.id });
    }
  }

  public getOptionsDifferences(
    rawOldOptions:
      | (FieldMetadataDefaultOption | FieldMetadataComplexOption)[]
      | null,
    rawNewOptions:
      | (FieldMetadataDefaultOption | FieldMetadataComplexOption)[]
      | null,
    compareLabel = false,
  ): GetOptionsDifferences {
    const differences: Differences<
      FieldMetadataDefaultOption | FieldMetadataComplexOption
    > = {
      created: [],
      updated: [],
      deleted: [],
    };

    const oldOptions = rawOldOptions ?? [];
    const newOptions = rawNewOptions ?? [];

    const oldOptionsMap = new Map(oldOptions.map((opt) => [opt.id, opt]));

    for (const newOption of newOptions) {
      const oldOption = oldOptionsMap.get(newOption.id);

      if (!isDefined(oldOption)) {
        differences.created.push(newOption);
        continue;
      }

      if (
        oldOption.value !== newOption.value ||
        (compareLabel && oldOption.label !== newOption.label)
      ) {
        differences.updated.push({ old: oldOption, new: newOption });
        continue;
      }
    }

    const newOptionsMap = new Map(newOptions.map((opt) => [opt.id, opt]));

    for (const oldOption of oldOptions) {
      if (!newOptionsMap.has(oldOption.id)) {
        differences.deleted.push(oldOption);
      }
    }

    return differences;
  }

  private async getFieldMetadataViewWithRelation(
    fieldMetadata: SelectOrMultiSelectFieldMetadataEntity,
    relation: keyof Pick<ViewWorkspaceEntity, 'viewGroups' | 'viewFilters'>,
  ): Promise<ViewWorkspaceEntity[]> {
    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
        fieldMetadata.workspaceId,
        'view',
      );

    return viewRepository.find({
      where: {
        [relation]: {
          fieldMetadataId: fieldMetadata.id,
        },
      },
      relations: [relation],
    });
  }

  private getMaxPosition(viewGroups: ViewGroupWorkspaceEntity[]): number {
    return viewGroups.reduce((max, group) => Math.max(max, group.position), 0);
  }

  async createViewAndViewFields(
    createdFieldMetadatas: FieldMetadataEntity[],
    workspaceId: string,
  ) {
    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId,
      });

    await workspaceDataSource.transaction(
      async (workspaceEntityManager: WorkspaceEntityManager) => {
        const viewsRepository = workspaceEntityManager.getRepository('view', {
          shouldBypassPermissionChecks: true,
        });

        const viewFieldsRepository = workspaceEntityManager.getRepository(
          'viewField',
          {
            shouldBypassPermissionChecks: true,
          },
        );

        for (const createdFieldMetadata of createdFieldMetadatas) {
          const views = await viewsRepository.find({
            where: {
              objectMetadataId: createdFieldMetadata.objectMetadataId,
            },
          });

          if (!isEmpty(views)) {
            const view = views[0];
            const existingViewFields = await viewFieldsRepository.find({
              where: {
                viewId: view.id,
              },
            });

            const isVisible =
              existingViewFields.length < settings.maxVisibleViewFields;

            const createdFieldIsAlreadyInView = existingViewFields.some(
              (existingViewField) =>
                existingViewField.fieldMetadataId === createdFieldMetadata.id,
            );

            if (!createdFieldIsAlreadyInView) {
              const lastPosition = existingViewFields
                .map((viewField) => viewField.position)
                .reduce((acc, position) => {
                  if (position > acc) {
                    return position;
                  }

                  return acc;
                }, -1);

              await viewFieldsRepository.insert({
                fieldMetadataId: createdFieldMetadata.id,
                position: lastPosition + 1,
                isVisible,
                size: 180,
                viewId: view.id,
              });
            }
          }
        }
      },
    );
  }
}
