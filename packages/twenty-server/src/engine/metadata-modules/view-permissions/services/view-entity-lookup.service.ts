import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { type ViewChildEntityKind } from 'src/engine/metadata-modules/view-permissions/types/view-permissions.types';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';

@Injectable()
export class ViewEntityLookupService {
  constructor(
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
    @InjectRepository(ViewFilterEntity)
    private readonly viewFilterRepository: Repository<ViewFilterEntity>,
    @InjectRepository(ViewFilterGroupEntity)
    private readonly viewFilterGroupRepository: Repository<ViewFilterGroupEntity>,
    @InjectRepository(ViewGroupEntity)
    private readonly viewGroupRepository: Repository<ViewGroupEntity>,
    @InjectRepository(ViewSortEntity)
    private readonly viewSortRepository: Repository<ViewSortEntity>,
  ) {}

  async findViewIdByEntityIdAndKind(
    kind: ViewChildEntityKind,
    entityId: string,
    workspaceId: string,
  ): Promise<string | null> {
    switch (kind) {
      case 'viewField': {
        const row = await this.viewFieldRepository.findOne({
          where: { id: entityId, workspaceId },
          select: ['viewId'],
        });

        if (row) return row.viewId;
        break;
      }

      case 'viewFilter': {
        const row = await this.viewFilterRepository.findOne({
          where: { id: entityId, workspaceId },
          select: ['viewId'],
        });

        if (row) return row.viewId;
        break;
      }

      case 'viewFilterGroup': {
        const row = await this.viewFilterGroupRepository.findOne({
          where: { id: entityId, workspaceId },
          select: ['viewId'],
        });

        if (row) return row.viewId;
        break;
      }

      case 'viewGroup': {
        const row = await this.viewGroupRepository.findOne({
          where: { id: entityId, workspaceId },
          select: ['viewId'],
        });

        if (row) return row.viewId;
        break;
      }

      case 'viewSort': {
        const row = await this.viewSortRepository.findOne({
          where: { id: entityId, workspaceId },
          select: ['viewId'],
        });

        if (row) return row.viewId;
        break;
      }
      default:
        break;
    }

    return null;
  }
}
