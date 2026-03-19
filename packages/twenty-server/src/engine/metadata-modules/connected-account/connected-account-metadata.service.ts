import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Injectable()
export class ConnectedAccountMetadataService {
  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly repository: Repository<ConnectedAccountEntity>,
  ) {}

  async findAll(workspaceId: string): Promise<ConnectedAccountEntity[]> {
    return this.repository.find({ where: { workspaceId } });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<ConnectedAccountEntity | null> {
    return this.repository.findOne({ where: { id, workspaceId } });
  }

  async create(
    data: Partial<ConnectedAccountEntity> & {
      workspaceId: string;
      handle: string;
      provider: string;
      userWorkspaceId: string;
    },
  ): Promise<ConnectedAccountEntity> {
    const entity = this.repository.create(data);

    return this.repository.save(entity);
  }

  async update(
    id: string,
    workspaceId: string,
    data: Partial<ConnectedAccountEntity>,
  ): Promise<ConnectedAccountEntity> {
    await this.repository.update(
      { id, workspaceId },
      data as Record<string, unknown>,
    );

    return this.repository.findOneOrFail({ where: { id, workspaceId } });
  }

  async delete(
    id: string,
    workspaceId: string,
  ): Promise<ConnectedAccountEntity> {
    const entity = await this.repository.findOneOrFail({
      where: { id, workspaceId },
    });

    await this.repository.delete({ id, workspaceId });

    return entity;
  }
}
