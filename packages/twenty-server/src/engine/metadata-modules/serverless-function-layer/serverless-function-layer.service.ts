import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { Repository } from 'typeorm';

import { ServerlessFunctionLayerEntity } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.entity';
import { CreateServerlessFunctionLayerInput } from 'src/engine/metadata-modules/serverless-function-layer/dtos/create-serverless-function-layer.input';

@Injectable()
export class ServerlessFunctionLayerService {
  constructor(
    @InjectRepository(ServerlessFunctionLayerEntity)
    private readonly serverlessFunctionLayerRepository: Repository<ServerlessFunctionLayerEntity>,
  ) {}

  private computeChecksum(yarnLock: string) {
    return crypto.createHash('sha256').update(yarnLock).digest('hex');
  }

  async create(
    { packageJson, yarnLock }: CreateServerlessFunctionLayerInput,
    workspaceId: string,
  ) {
    const checksum = this.computeChecksum(yarnLock);

    const serverlessFunctionLayer =
      this.serverlessFunctionLayerRepository.create({
        packageJson,
        yarnLock,
        checksum,
        workspaceId,
      });

    return this.serverlessFunctionLayerRepository.save(serverlessFunctionLayer);
  }

  async update(id: string, data: Partial<ServerlessFunctionLayerEntity>) {
    const checksum = data.yarnLock
      ? this.computeChecksum(data.yarnLock)
      : undefined;

    const updateData = { ...data, ...(checksum && { checksum }) };

    return this.serverlessFunctionLayerRepository.update({ id }, updateData);
  }
}
