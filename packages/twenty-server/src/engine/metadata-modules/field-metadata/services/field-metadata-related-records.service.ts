import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isSelectFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-select-field-metadata-type.util';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ViewFilterWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter.workspace-entity';
import { ViewGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-group.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type Differences<T> = {
  created: T[];
  updated: { old: T; new: T }[];
  deleted: T[];
};

export type SelectFieldMetadataEntity = FieldMetadataEntity<FieldMetadataType.SELECT>;

@Injectable()
export class FieldMetadataRelatedRecordsService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  public async updateRelatedViewGroups(
    oldFieldMetadata: SelectFieldMetadataEntity,
    newFieldMetadata: SelectFieldMetadataEntity,
  ): Promise<void> {
    if (
      !isSelectFieldMetadataType(newFieldMetadata.type) ||
      !isSelectFieldMetadataType(oldFieldMetadata.type)
    ) {
      return;
    }

    const views = await this.getFieldMetadataViewEntity(
      newFieldMetadata,
      'viewGroups',
    );

    const { created, updated, deleted } = this.getOptionsDifferences(
      oldFieldMetadata.options,
      newFieldMetadata.options,
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

      await viewGroupRepository.insert(viewGroupsToCreate);

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

      const valuesToDelete = deleted.map((option) => option.value);

      await viewGroupRepository.delete({
        fieldMetadataId: newFieldMetadata.id,
        fieldValue: In(valuesToDelete),
      });

      await this.syncNoValueViewGroup(
        newFieldMetadata,
        view,
        viewGroupRepository,
      );
    }
  }

  public async updateRelatedViewFilters(
    oldFieldMetadata: SelectFieldMetadataEntity,
    newFieldMetadata: SelectFieldMetadataEntity,
  ): Promise<void> {
    if (
      !isSelectFieldMetadataType(newFieldMetadata.type) ||
      !isSelectFieldMetadataType(oldFieldMetadata.type)
    ) {
      return;
    }

    const filters = await this.getFieldMetadataViewEntity(
      newFieldMetadata,
      'viewFilters',
    );

    const { updated: updatedFieldMetadata, deleted: deletedFieldMetadata } =
      this.getOptionsDifferences(
        oldFieldMetadata.options,
        newFieldMetadata.options,
      );

    const viewFilterRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewFilterWorkspaceEntity>(
        newFieldMetadata.workspaceId,
        'viewFilter',
      );

    for (const filter of filters) {
      if (filter.viewFilters.length === 0) {
        continue;
      }

      for (const viewFilter of filter.viewFilters) {
        try {
          const viewFilterValue: string[] = JSON.parse(viewFilter.value);
          const relatedDeletedLabels = deletedFieldMetadata
            .filter((deleted) => viewFilterValue.includes(deleted.label))
            .map(({ label }) => label);

          if (relatedDeletedLabels.length === viewFilterValue.length) {
            await viewFilterRepository.delete({ id: viewFilter.id });
            continue;
          }

          const remainingFilterLabels = viewFilterValue.filter(
            (viewFilterLabel) => !relatedDeletedLabels.includes(viewFilterLabel),
          );
          const relatedUpdatedLabels = updatedFieldMetadata
            .filter((updated) =>
              remainingFilterLabels.includes(updated.old.label),
            )
            .map((data) => ({
              newLabel: data.new.label,
              oldLabel: data.old.label,
            }));

          const updatedFilterLabels = remainingFilterLabels.flatMap((label) => {
            const containsUpdatedFilter = relatedUpdatedLabels.find(
              ({ oldLabel }) => label === oldLabel,
            );
            if (!isDefined(containsUpdatedFilter)) {
              return label;
            }

            return containsUpdatedFilter.newLabel;
          });

          await viewFilterRepository.update(
            { id: viewFilter.id },
            {
              value: JSON.stringify(updatedFilterLabels),
              displayValue: updatedFilterLabels.join(','),
            },
          );

          ///
        } catch (error) {
          // TODO
          console.error(error);
        }
      }
    }
  }

  async syncNoValueViewGroup(
    fieldMetadata: SelectFieldMetadataEntity,
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

  private getOptionsDifferences(
    oldOptions: (FieldMetadataDefaultOption | FieldMetadataComplexOption)[],
    newOptions: (FieldMetadataDefaultOption | FieldMetadataComplexOption)[],
  ): Differences<FieldMetadataDefaultOption | FieldMetadataComplexOption> {
    const differences: Differences<
      FieldMetadataDefaultOption | FieldMetadataComplexOption
    > = {
      created: [],
      updated: [],
      deleted: [],
    };

    const oldOptionsMap = new Map(oldOptions.map((opt) => [opt.id, opt]));
    const newOptionsMap = new Map(newOptions.map((opt) => [opt.id, opt]));

    for (const newOption of newOptions) {
      const oldOption = oldOptionsMap.get(newOption.id);

      if (!oldOption) {
        differences.created.push(newOption);
      } else if (oldOption.value !== newOption.value) {
        differences.updated.push({ old: oldOption, new: newOption });
      }
    }

    for (const oldOption of oldOptions) {
      if (!newOptionsMap.has(oldOption.id)) {
        differences.deleted.push(oldOption);
      }
    }

    return differences;
  }

  private async getFieldMetadataViewEntity(
    fieldMetadata: SelectFieldMetadataEntity,
    entity: 'viewGroups' | 'viewFilters',
  ): Promise<ViewWorkspaceEntity[]> {
    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
        fieldMetadata.workspaceId,
        'view',
      );

    return viewRepository.find({
      where: {
        [entity]: {
          fieldMetadataId: fieldMetadata.id,
        },
      },
      relations: [entity],
    });
  }

  private getMaxPosition(viewGroups: ViewGroupWorkspaceEntity[]): number {
    return viewGroups.reduce((max, group) => Math.max(max, group.position), 0);
  }
}
