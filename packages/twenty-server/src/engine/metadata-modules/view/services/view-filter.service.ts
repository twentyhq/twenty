import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { ViewFilter } from 'src/engine/metadata-modules/view/entities/view-filter.entity';
import {
  ViewFilterException,
  ViewFilterExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view-filter.exception';

@Injectable()
export class ViewFilterService {
  constructor(
    @InjectRepository(ViewFilter, 'core')
    private readonly viewFilterRepository: Repository<ViewFilter>,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<ViewFilter[]> {
    return this.viewFilterRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { positionInViewFilterGroup: 'ASC' },
    });
  }

  async findByViewId(
    workspaceId: string,
    viewId: string,
  ): Promise<ViewFilter[]> {
    return this.viewFilterRepository.find({
      where: {
        workspaceId,
        viewId,
        deletedAt: IsNull(),
      },
      order: { positionInViewFilterGroup: 'ASC' },
    });
  }

  async findByFieldMetadataId(
    workspaceId: string,
    fieldMetadataId: string,
  ): Promise<ViewFilter[]> {
    return this.viewFilterRepository.find({
      where: {
        workspaceId,
        fieldMetadataId,
        deletedAt: IsNull(),
      },
    });
  }

  async findByViewFilterGroupId(
    workspaceId: string,
    viewFilterGroupId: string,
  ): Promise<ViewFilter[]> {
    return this.viewFilterRepository.find({
      where: {
        workspaceId,
        viewFilterGroupId,
        deletedAt: IsNull(),
      },
      order: { positionInViewFilterGroup: 'ASC' },
    });
  }

  async findById(id: string, workspaceId: string): Promise<ViewFilter | null> {
    const viewFilter = await this.viewFilterRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    return viewFilter || null;
  }

  async create(viewFilterData: Partial<ViewFilter>): Promise<ViewFilter> {
    if (!viewFilterData.workspaceId) {
      throw new ViewFilterException(
        'WorkspaceId is required',
        ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        {
          userFriendlyMessage:
            'WorkspaceId is required to create a view filter.',
        },
      );
    }

    if (!viewFilterData.viewId) {
      throw new ViewFilterException(
        'ViewId is required',
        ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        { userFriendlyMessage: 'ViewId is required to create a view filter.' },
      );
    }

    if (!viewFilterData.fieldMetadataId) {
      throw new ViewFilterException(
        'FieldMetadataId is required',
        ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA,
        {
          userFriendlyMessage:
            'FieldMetadataId is required to create a view filter.',
        },
      );
    }

    const viewFilter = this.viewFilterRepository.create(viewFilterData);

    return this.viewFilterRepository.save(viewFilter);
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<ViewFilter>,
  ): Promise<ViewFilter | null> {
    const viewFilter = await this.findById(id, workspaceId);

    if (!viewFilter) {
      return null;
    }

    await this.viewFilterRepository.update(id, updateData);

    return this.findById(id, workspaceId);
  }

  async delete(id: string, workspaceId: string): Promise<ViewFilter | null> {
    const viewFilter = await this.findById(id, workspaceId);

    if (!viewFilter) {
      return null;
    }

    await this.viewFilterRepository.softDelete(id);

    return viewFilter;
  }

  async validateViewFilter(
    id: string,
    workspaceId: string,
  ): Promise<ViewFilter> {
    const viewFilter = await this.findById(id, workspaceId);

    if (!viewFilter) {
      throw new ViewFilterException(
        `ViewFilter with id ${id} not found`,
        ViewFilterExceptionCode.VIEW_FILTER_NOT_FOUND,
      );
    }

    return viewFilter;
  }

  async bulkDeleteByFieldMetadataId(
    workspaceId: string,
    fieldMetadataId: string,
  ): Promise<void> {
    await this.viewFilterRepository.softDelete({
      workspaceId,
      fieldMetadataId,
    });
  }

  async bulkDeleteByViewId(workspaceId: string, viewId: string): Promise<void> {
    await this.viewFilterRepository.softDelete({
      workspaceId,
      viewId,
    });
  }

  async bulkDeleteByViewFilterGroupId(
    workspaceId: string,
    viewFilterGroupId: string,
  ): Promise<void> {
    await this.viewFilterRepository.softDelete({
      workspaceId,
      viewFilterGroupId,
    });
  }
}
