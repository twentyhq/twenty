import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, parseJson } from 'twenty-shared/utils';

import { settings } from 'src/engine/constants/settings';
import { ViewGroupEntity } from 'src/engine/core-modules/view/entities/view-group.entity';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewKey } from 'src/engine/core-modules/view/enums/view-key.enum';
import { ViewFieldService } from 'src/engine/core-modules/view/services/view-field.service';
import { ViewFilterService } from 'src/engine/core-modules/view/services/view-filter.service';
import { ViewGroupService } from 'src/engine/core-modules/view/services/view-group.service';
import { ViewService } from 'src/engine/core-modules/view/services/view.service';
import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { isSelectFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-select-field-metadata-type.util';
import { type SelectOrMultiSelectFieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/utils/is-select-or-multi-select-field-metadata.util';

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
    private readonly viewService: ViewService,
    private readonly viewFieldService: ViewFieldService,
    private readonly viewFilterService: ViewFilterService,
    private readonly viewGroupService: ViewGroupService,
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
    const objectMetadataViews = await this.viewService.findByObjectMetadataId(
      newFieldMetadata.workspaceId,
      newFieldMetadata.objectMetadataId,
    );

    const { created, updated, deleted } = this.getOptionsDifferences(
      oldFieldMetadata.options ?? [],
      newFieldMetadata.options ?? [],
    );

    for (const view of objectMetadataViews) {
      if (view.viewGroups.length === 0) {
        continue;
      }

      const valuesToDelete = deleted.map((option) => option.value);

      if (valuesToDelete.length > 0) {
        for (const valueToDelete of valuesToDelete) {
          const viewGroupsToDelete = view.viewGroups.filter(
            (group) => group.fieldValue === valueToDelete,
          );

          for (const viewGroup of viewGroupsToDelete) {
            await this.viewGroupService.destroy(
              viewGroup.id,
              newFieldMetadata.workspaceId,
            );
          }
        }
      }
      const maxPosition = this.getMaxPosition(view.viewGroups);

      for (const [index, option] of created.entries()) {
        this.viewGroupService.create({
          fieldMetadataId: newFieldMetadata.id,
          fieldValue: option.value,
          position: maxPosition + index,
          isVisible: true,
          viewId: view.id,
          workspaceId: newFieldMetadata.workspaceId,
        });
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

        this.viewGroupService.update(
          existingViewGroup.id,
          newFieldMetadata.workspaceId,
          { fieldValue: newOption.value },
        );
      }

      await this.syncNoValueViewGroup(newFieldMetadata, view);
    }
  }

  public async resetViewKanbanAggregateOperation(
    fieldMetadata: Pick<
      FieldMetadataEntity,
      'id' | 'workspaceId' | 'objectMetadataId'
    >,
  ): Promise<void> {
    const views = await this.viewService.findByObjectMetadataId(
      fieldMetadata.workspaceId,
      fieldMetadata.objectMetadataId,
    );

    const viewsHavingFieldAsAggregateOperation = views.filter(
      (view) =>
        view.kanbanAggregateOperationFieldMetadataId === fieldMetadata.id,
    );

    for (const view of viewsHavingFieldAsAggregateOperation) {
      await this.viewService.update(view.id, fieldMetadata.workspaceId, {
        kanbanAggregateOperationFieldMetadataId: null,
        kanbanAggregateOperation: null,
      });
    }
  }

  public async updateRelatedViewFilters(
    oldFieldMetadata: SelectOrMultiSelectFieldMetadataEntity,
    newFieldMetadata: SelectOrMultiSelectFieldMetadataEntity,
  ): Promise<void> {
    const views = await this.viewService.findByObjectMetadataId(
      newFieldMetadata.workspaceId,
      newFieldMetadata.objectMetadataId,
    );

    const fieldMetadataViews = views.filter((view) =>
      view.viewFilters.some(
        (filter) => filter.fieldMetadataId === newFieldMetadata.id,
      ),
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

    for (const view of fieldMetadataViews) {
      if (view.viewFilters.length === 0) {
        continue;
      }

      for (const viewFilter of view.viewFilters) {
        if (!isDefined(viewFilter.value)) {
          continue;
        }

        // TODO: all view filter value should be stored as JSON, this is ongoing work (we are missing a command to migrate the data)
        const parsedValue = isNonEmptyString(viewFilter.value)
          ? parseJson(viewFilter.value)
          : viewFilter.value;

        if (!isDefined(parsedValue) || !Array.isArray(parsedValue)) {
          throw new FieldMetadataException(
            `Unexpected invalid view filter value for filter ${viewFilter.id}`,
            FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
          );
        }

        const viewFilterOptions = parsedValue
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
          await this.viewFilterService.destroy(
            viewFilter.id,
            newFieldMetadata.workspaceId,
          );
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

        const value = afterUpdateAndDeleteViewFilterOptions.map(
          (option) => option.value,
        );

        await this.viewFilterService.update(
          viewFilter.id,
          newFieldMetadata.workspaceId,
          {
            value,
          },
        );
      }
    }
  }

  async syncNoValueViewGroup(
    fieldMetadata: SelectOrMultiSelectFieldMetadataEntity,
    view: ViewEntity,
  ): Promise<void> {
    const noValueGroup = view.viewGroups.find(
      (group) => group.fieldValue === '',
    );

    if (fieldMetadata.isNullable && !noValueGroup) {
      const maxPosition = this.getMaxPosition(view.viewGroups);

      this.viewGroupService.create({
        fieldMetadataId: fieldMetadata.id,
        fieldValue: '',
        position: maxPosition + 1,
        isVisible: true,
        viewId: view.id,
        workspaceId: fieldMetadata.workspaceId,
      });
    } else if (!fieldMetadata.isNullable && noValueGroup) {
      await this.viewGroupService.destroy(
        noValueGroup.id,
        fieldMetadata.workspaceId,
      );
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

  private getMaxPosition(viewGroups: ViewGroupEntity[]): number {
    return viewGroups.reduce((max, group) => Math.max(max, group.position), 0);
  }

  async createViewAndViewFields(
    createdFieldMetadatas: FieldMetadataEntity[],
    workspaceId: string,
  ) {
    const views = await this.viewService.findByWorkspaceId(workspaceId);

    for (const createdFieldMetadata of createdFieldMetadatas) {
      const objectViews = views.filter(
        (view) =>
          view.objectMetadataId === createdFieldMetadata.objectMetadataId,
      );

      if (objectViews.length === 0) {
        return;
      }

      const indexView = objectViews.find((view) => view.key === ViewKey.INDEX);

      if (!indexView) {
        return;
      }
      const isVisible =
        indexView.viewFields.length < settings.maxVisibleViewFields;

      const createdFieldIsAlreadyInView = indexView.viewFields.some(
        (existingViewField) =>
          existingViewField.fieldMetadataId === createdFieldMetadata.id,
      );

      if (createdFieldIsAlreadyInView) {
        continue;
      }

      const lastPosition = indexView.viewFields
        .map((viewField) => viewField.position)
        .reduce((acc, position) => {
          if (position > acc) {
            return position;
          }

          return acc;
        }, -1);

      await this.viewFieldService.create({
        fieldMetadataId: createdFieldMetadata.id,
        position: lastPosition + 1,
        isVisible,
        size: 180,
        viewId: indexView.id,
        workspaceId: createdFieldMetadata.workspaceId,
      });
    }
  }
}
