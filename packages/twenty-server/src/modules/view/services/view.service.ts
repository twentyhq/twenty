import { Injectable, Logger } from '@nestjs/common';

import isEmpty from 'lodash.isempty';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';

@Injectable()
export class ViewService {
  private readonly logger = new Logger(ViewService.name);
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async addFieldToViewsContainingOldField({
    workspaceId,
    newFieldId,
    oldFieldId,
  }: {
    workspaceId: string;
    newFieldId: string;
    oldFieldId: string;
  }): Promise<void> {
    const viewFieldRepository =
      await this.twentyORMManager.getRepositoryForWorkspace(
        workspaceId,
        ViewFieldWorkspaceEntity,
      );
    const viewsWithDeprecatedField = await viewFieldRepository.find({
      where: {
        fieldMetadataId: oldFieldId,
        isVisible: true,
      },
    });

    for (const viewWithDeprecatedField of viewsWithDeprecatedField) {
      const viewId = viewWithDeprecatedField.viewId;

      const newFieldInThisView = await viewFieldRepository.findBy({
        fieldMetadataId: newFieldId,
        viewId: viewWithDeprecatedField.viewId as string,
        isVisible: true,
      });

      if (!isEmpty(newFieldInThisView)) {
        continue;
      }

      this.logger.log(
        `Adding new field ${newFieldId} to view ${viewId} for workspace ${workspaceId}...`,
      );
      const newViewField = viewFieldRepository.create({
        viewId: viewWithDeprecatedField.viewId,
        fieldMetadataId: newFieldId,
        position: viewWithDeprecatedField.position - 0.5,
        isVisible: true,
      });

      await viewFieldRepository.save(newViewField);
      this.logger.log(
        `New field successfully added to view ${viewId} for workspace ${workspaceId}`,
      );
    }
  }

  async removeFieldFromViews({
    workspaceId,
    fieldId,
  }: {
    workspaceId: string;
    fieldId: string;
  }) {
    const viewFieldRepository =
      await this.twentyORMManager.getRepositoryForWorkspace(
        workspaceId,
        ViewFieldWorkspaceEntity,
      );
    const viewsWithField = await viewFieldRepository.find({
      where: {
        fieldMetadataId: fieldId,
        isVisible: true,
      },
    });

    for (const viewWithField of viewsWithField) {
      const viewId = viewWithField.viewId;

      this.logger.log(
        `Removing field ${fieldId} from view ${viewId} for workspace ${workspaceId}...`,
      );
      await viewFieldRepository.delete({
        viewId: viewWithField.viewId as string,
        fieldMetadataId: fieldId,
        position: viewWithField.position - 0.5,
        isVisible: true,
      });

      this.logger.log(
        `Field ${fieldId} successfully removed from view ${viewId} for workspace ${workspaceId}`,
      );
    }
  }
}
