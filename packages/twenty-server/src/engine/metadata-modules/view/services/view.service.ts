import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Repository } from 'typeorm';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { FIND_ALL_CORE_VIEWS_GRAPHQL_OPERATION } from 'src/engine/metadata-modules/view/constants/find-all-core-views-graphql-operation.constant';
import { ViewRoleEntity } from 'src/engine/metadata-modules/view/entities/view-role.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import {
  ViewException,
  ViewExceptionCode,
  ViewExceptionMessageKey,
  generateViewExceptionMessage,
  generateViewUserFriendlyExceptionMessage,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class ViewService {
  constructor(
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    @InjectRepository(ViewRoleEntity)
    private readonly viewRoleRepository: Repository<ViewRoleEntity>,
    private readonly i18nService: I18nService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<ViewEntity[]> {
    return this.viewRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
      relations: [
        'workspace',
        'viewFields',
        'viewFilters',
        'viewSorts',
        'viewGroups',
        'viewFilterGroups',
        'viewRoles',
        'viewRoles.role',
      ],
    });
  }

  async findByObjectMetadataId(
    workspaceId: string,
    objectMetadataId: string,
  ): Promise<ViewEntity[]> {
    return this.viewRepository.find({
      where: {
        workspaceId,
        objectMetadataId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
      relations: [
        'workspace',
        'viewFields',
        'viewFilters',
        'viewSorts',
        'viewGroups',
        'viewFilterGroups',
        'viewRoles',
        'viewRoles.role',
      ],
    });
  }

  async findById(id: string, workspaceId: string): Promise<ViewEntity | null> {
    const view = await this.viewRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: [
        'workspace',
        'viewFields',
        'viewFilters',
        'viewSorts',
        'viewGroups',
        'viewFilterGroups',
        'viewRoles',
        'viewRoles.role',
      ],
    });

    return view || null;
  }

  async create(viewData: Partial<ViewEntity>): Promise<ViewEntity> {
    if (!isDefined(viewData.workspaceId)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.WORKSPACE_ID_REQUIRED,
        ),
        ViewExceptionCode.INVALID_VIEW_DATA,
        {
          userFriendlyMessage: generateViewUserFriendlyExceptionMessage(
            ViewExceptionMessageKey.WORKSPACE_ID_REQUIRED,
          ),
        },
      );
    }

    if (!isDefined(viewData.objectMetadataId)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.OBJECT_METADATA_ID_REQUIRED,
        ),
        ViewExceptionCode.INVALID_VIEW_DATA,
        {
          userFriendlyMessage: generateViewUserFriendlyExceptionMessage(
            ViewExceptionMessageKey.OBJECT_METADATA_ID_REQUIRED,
          ),
        },
      );
    }

    const view = this.viewRepository.create({
      ...viewData,
      isCustom: true,
    });

    const savedView = await this.viewRepository.save(view);

    await this.flushGraphQLCache(viewData.workspaceId);

    return savedView;
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<ViewEntity>,
  ): Promise<ViewEntity> {
    const existingView = await this.findById(id, workspaceId);

    if (!isDefined(existingView)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.VIEW_NOT_FOUND,
          id,
        ),
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    const updatedView = await this.viewRepository.save({
      id,
      ...updateData,
    });

    await this.flushGraphQLCache(workspaceId);

    return { ...existingView, ...updatedView };
  }

  async delete(id: string, workspaceId: string): Promise<ViewEntity> {
    const view = await this.findById(id, workspaceId);

    if (!isDefined(view)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.VIEW_NOT_FOUND,
          id,
        ),
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    await this.viewRepository.softDelete(id);

    await this.flushGraphQLCache(workspaceId);

    return view;
  }

  async destroy(id: string, workspaceId: string): Promise<boolean> {
    const view = await this.findById(id, workspaceId);

    if (!isDefined(view)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.VIEW_NOT_FOUND,
          id,
        ),
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    await this.viewRepository.delete(id);
    await this.flushGraphQLCache(workspaceId);

    return true;
  }

  processViewNameWithTemplate(
    viewName: string,
    isCustom: boolean,
    objectLabelPlural?: string,
    locale?: keyof typeof APP_LOCALES,
  ): string {
    if (viewName.includes('{objectLabelPlural}') && objectLabelPlural) {
      const messageId = generateMessageId(viewName);
      const translatedTemplate = this.i18nService.translateMessage({
        messageId,
        values: {
          objectLabelPlural,
        },
        locale: locale ?? SOURCE_LOCALE,
      });

      if (translatedTemplate !== messageId) {
        return translatedTemplate;
      }

      return viewName.replace('{objectLabelPlural}', objectLabelPlural);
    }

    if (!isCustom) {
      const messageId = generateMessageId(viewName);
      const translatedMessage = this.i18nService.translateMessage({
        messageId,
        locale: locale ?? SOURCE_LOCALE,
      });

      if (translatedMessage !== messageId) {
        return translatedMessage;
      }
    }

    return viewName;
  }

  async syncViewRoles(
    viewId: string,
    workspaceId: string,
    roleIds?: string[],
  ): Promise<void> {
    if (!isDefined(roleIds)) {
      return;
    }

    // Get existing view roles
    const existingViewRoles = await this.viewRoleRepository.find({
      where: { viewId },
    });

    const existingRoleIds = existingViewRoles.map((vr) => vr.roleId);

    // Determine which roles to add and remove
    const roleIdsToAdd = roleIds.filter((id) => !existingRoleIds.includes(id));
    const roleIdsToRemove = existingRoleIds.filter(
      (id) => !roleIds.includes(id),
    );

    // Remove roles that are no longer assigned
    if (roleIdsToRemove.length > 0) {
      await this.viewRoleRepository.delete({
        viewId,
        roleId: In(roleIdsToRemove),
      });
    }

    // Add new roles
    if (roleIdsToAdd.length > 0) {
      const newViewRoles = roleIdsToAdd.map((roleId) => ({
        viewId,
        roleId,
        workspaceId,
      }));

      await this.viewRoleRepository.save(newViewRoles);
    }
  }

  async flushGraphQLCache(workspaceId: string): Promise<void> {
    await this.workspaceCacheStorageService.flushGraphQLOperation({
      operationName: FIND_ALL_CORE_VIEWS_GRAPHQL_OPERATION,
      workspaceId,
    });
  }
}
