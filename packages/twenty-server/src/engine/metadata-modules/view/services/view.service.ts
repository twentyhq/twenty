import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { View } from 'src/engine/metadata-modules/view/entities/view.entity';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';

@Injectable()
export class ViewService {
  constructor(
    @InjectRepository(View, 'core')
    private readonly viewRepository: Repository<View>,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<View[]> {
    return this.viewRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
    });
  }

  async findByObjectMetadataId(
    workspaceId: string,
    objectMetadataId: string,
  ): Promise<View[]> {
    return this.viewRepository.find({
      where: {
        workspaceId,
        objectMetadataId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
    });
  }

  async findById(id: string, workspaceId: string): Promise<View | null> {
    const view = await this.viewRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    return view || null;
  }

  async create(viewData: Partial<View>): Promise<View> {
    if (!viewData.workspaceId) {
      throw new ViewException(
        'WorkspaceId is required',
        ViewExceptionCode.INVALID_VIEW_DATA,
        { userFriendlyMessage: 'WorkspaceId is required to create a view.' },
      );
    }

    if (!viewData.objectMetadataId) {
      throw new ViewException(
        'ObjectMetadataId is required',
        ViewExceptionCode.INVALID_VIEW_DATA,
        {
          userFriendlyMessage: 'ObjectMetadataId is required to create a view.',
        },
      );
    }

    const view = this.viewRepository.create(viewData);

    return this.viewRepository.save(view);
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<View>,
  ): Promise<View | null> {
    const view = await this.findById(id, workspaceId);

    if (!view) {
      return null;
    }

    await this.viewRepository.update(id, updateData);

    return this.findById(id, workspaceId);
  }

  async delete(id: string, workspaceId: string): Promise<View | null> {
    const view = await this.findById(id, workspaceId);

    if (!view) {
      return null;
    }

    await this.viewRepository.softDelete(id);

    return view;
  }

  async validateView(id: string, workspaceId: string): Promise<View> {
    const view = await this.findById(id, workspaceId);

    if (!view) {
      throw new ViewException(
        `View with id ${id} not found`,
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    return view;
  }
}
