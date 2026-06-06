import { Injectable } from '@nestjs/common';

import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { type ViewChildEntityKind } from 'src/engine/metadata-modules/view-permissions/types/view-permissions.types';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class ViewEntityLookupService {
  constructor(
    @InjectWorkspaceScopedRepository(ViewFieldEntity)
    private readonly viewFieldRepository: WorkspaceScopedRepository<ViewFieldEntity>,
    @InjectWorkspaceScopedRepository(ViewFilterEntity)
    private readonly viewFilterRepository: WorkspaceScopedRepository<ViewFilterEntity>,
    @InjectWorkspaceScopedRepository(ViewFilterGroupEntity)
    private readonly viewFilterGroupRepository: WorkspaceScopedRepository<ViewFilterGroupEntity>,
    @InjectWorkspaceScopedRepository(ViewGroupEntity)
    private readonly viewGroupRepository: WorkspaceScopedRepository<ViewGroupEntity>,
    @InjectWorkspaceScopedRepository(ViewSortEntity)
    private readonly viewSortRepository: WorkspaceScopedRepository<ViewSortEntity>,
  ) {}

  async findViewIdByEntityIdAndKind(
    kind: ViewChildEntityKind,
    entityId: string,
    workspaceId: string,
  ): Promise<string | null> {
    switch (kind) {
      case 'viewField': {
        const row = await this.viewFieldRepository.findOne(workspaceId, {
          where: { id: entityId },
          select: ['viewId'],
        });

        if (row) return row.viewId;
        break;
      }

      case 'viewFilter': {
        const row = await this.viewFilterRepository.findOne(workspaceId, {
          where: { id: entityId },
          select: ['viewId'],
        });

        if (row) return row.viewId;
        break;
      }

      case 'viewFilterGroup': {
        const row = await this.viewFilterGroupRepository.findOne(workspaceId, {
          where: { id: entityId },
          select: ['viewId'],
        });

        if (row) return row.viewId;
        break;
      }

      case 'viewGroup': {
        const row = await this.viewGroupRepository.findOne(workspaceId, {
          where: { id: entityId },
          select: ['viewId'],
        });

        if (row) return row.viewId;
        break;
      }

      case 'viewSort': {
        const row = await this.viewSortRepository.findOne(workspaceId, {
          where: { id: entityId },
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
