import { Injectable } from '@nestjs/common';

import { type ViewType } from '@prisma/client';

import { PrismaService } from 'src/database/prisma.service';
import seedViews from 'src/core/view/seed-data/views.json';

@Injectable()
export class ViewService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find
  findFirst = this.prismaService.client.view.findFirst;
  findFirstOrThrow = this.prismaService.client.view.findFirstOrThrow;

  findUnique = this.prismaService.client.view.findUnique;
  findUniqueOrThrow = this.prismaService.client.view.findUniqueOrThrow;

  findMany = this.prismaService.client.view.findMany;

  // Create
  create = this.prismaService.client.view.create;
  createMany = this.prismaService.client.view.createMany;

  // Update
  update = this.prismaService.client.view.update;
  upsert = this.prismaService.client.view.upsert;
  updateMany = this.prismaService.client.view.updateMany;

  // Delete
  delete = this.prismaService.client.view.delete;
  deleteMany = this.prismaService.client.view.deleteMany;

  // Aggregate
  aggregate = this.prismaService.client.view.aggregate;

  // Count
  count = this.prismaService.client.view.count;

  // GroupBy
  groupBy = this.prismaService.client.view.groupBy;

  // Custom
  createDefaultViews({ workspaceId }: { workspaceId: string }) {
    return Promise.all(
      seedViews.map(async ({ fields, ...viewInput }) => {
        const view = await this.create({
          data: {
            ...viewInput,
            type: viewInput.type as ViewType,
            workspace: { connect: { id: workspaceId } },
          },
        });

        await this.prismaService.client.viewField.createMany({
          data: fields.map((viewField, index) => ({
            ...viewField,
            index,
            isVisible: true,
            objectId: view.objectId,
            viewId: view.id,
            workspaceId,
          })),
        });
      }),
    );
  }
}
