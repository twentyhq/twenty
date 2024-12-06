import { Injectable } from '@nestjs/common';

import { EntityManager, In } from 'typeorm';

import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isSelectFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-select-field-metadata-type.util';
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
  ) {
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

      const maxPosition = view.viewGroups.reduce(
        (max, viewGroup) => Math.max(max, viewGroup.position),
        0,
      );

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
        const viewGroup = view.viewGroups.find(
          (viewGroup) => viewGroup.fieldValue === oldOption.value,
        );

        if (!viewGroup) {
          throw new Error(`View group not found for option ${oldOption.value}`);
        }

        await viewGroupRepository.update(
          {
            id: viewGroup.id,
          },
          {
            fieldValue: newOption.value,
          },
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
    }
  }

  private getOptionsDifferences(
    oldOptions: (FieldMetadataDefaultOption | FieldMetadataComplexOption)[],
    newOptions: (FieldMetadataDefaultOption | FieldMetadataComplexOption)[],
  ) {
    const differences: Differences<
      FieldMetadataDefaultOption | FieldMetadataComplexOption
    > = {
      created: [],
      updated: [],
      deleted: [],
    };

    const oldOptionsMap = new Map(
      oldOptions.map((option) => [option.id, option]),
    );
    const newOptionsMap = new Map(
      newOptions.map((option) => [option.id, option]),
    );

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

    return await viewRepository.find({
      where: {
        viewGroups: {
          fieldMetadataId: fieldMetadata.id,
        },
      },
      relations: ['viewGroups'],
    });
  }
}
