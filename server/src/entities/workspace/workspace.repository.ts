import { Injectable } from '@nestjs/common';
import { Workspace, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class WorkspaceRepository {
    constructor(private prisma: PrismaService) {}

    async findMany(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.WorkspaceWhereUniqueInput;
        where?: Prisma.WorkspaceWhereInput;
        orderBy?: Prisma.WorkspaceOrderByWithRelationInput;
      }): Promise<Workspace[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.workspace.findMany({ skip, take, cursor, where, orderBy });
      }

      async findUnique(
          data: Prisma.WorkspaceFindUniqueArgs,
        ): Promise<Workspace | null> {
          return await this.prisma.workspace.findUnique(data);
        }
}
