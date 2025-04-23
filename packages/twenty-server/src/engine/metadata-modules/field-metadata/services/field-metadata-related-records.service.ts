import { Injectable } from '@nestjs/common';

import { EntityManager, In } from 'typeorm';

import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isSelectFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-select-field-metadata-type.util';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ViewGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-group.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

type Differences<T> = {
  created: T[];
  updated: { old: T; new: T }[];
  deleted: T[];
};

@Injectable()
export class FieldMetadataRelatedRecordsService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  public async updateRelatedViewGroups(
    oldFieldMetadata: FieldMetadataEntity,
    newFieldMetadata: FieldMetadataEntity,
    transactionManager?: EntityManager,
  ): Promise<void> {
    if (
      !isSelectFieldMetadataType(newFieldMetadata.type) ||
      !isSelectFieldMetadataType(oldFieldMetadata.type)
    ) {
      return;
    }

    const views = await this.getFieldMetadataViews(newFieldMetadata);

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

      await viewGroupRepository.insert(viewGroupsToCreate, transactionManager);

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
          transactionManager,
        );
      }

      const valuesToDelete = deleted.map((option) => option.value);

      await viewGroupRepository.delete(
        {
          fieldMetadataId: newFieldMetadata.id,
          fieldValue: In(valuesToDelete),
        },
        transactionManager,
      );

      await this.syncNoValueViewGroup(
        newFieldMetadata,
        view,
        viewGroupRepository,
        transactionManager,
      );
    }
  }

  async syncNoValueViewGroup(
    fieldMetadata: FieldMetadataEntity,
    view: ViewWorkspaceEntity,
    viewGroupRepository: WorkspaceRepository<ViewGroupWorkspaceEntity>,
    transactionManager?: EntityManager,
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

      await viewGroupRepository.insert(newGroup, transactionManager);
    } else if (!fieldMetadata.isNullable && noValueGroup) {
      await viewGroupRepository.delete(
        { id: noValueGroup.id },
        transactionManager,
      );
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

  private async getFieldMetadataViews(
    fieldMetadata: FieldMetadataEntity,
  ): Promise<ViewWorkspaceEntity[]> {
    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
        fieldMetadata.workspaceId,
        'view',
      );

    return viewRepository.find({
      where: {
        viewGroups: {
          fieldMetadataId: fieldMetadata.id,
        },
      },
      relations: ['viewGroups'],
    });
  }

  private getMaxPosition(viewGroups: ViewGroupWorkspaceEntity[]): number {
    return viewGroups.reduce((max, group) => Math.max(max, group.position), 0);
  }
}
