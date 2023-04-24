import { Injectable } from '@nestjs/common';
import { Prisma, Workspace } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WorkspaceRepository {
  constructor(private prisma: PrismaService) {}

  async findWorkspaceByDomainName(
    data: Prisma.WorkspaceFindUniqueArgs,
  ): Promise<Workspace | null> {
    return await this.prisma.workspace.findUnique(data);
  }
}
