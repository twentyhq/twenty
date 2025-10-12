import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { ServerlessFunctionLayerEntity } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.entity';
import { CreateServerlessFunctionLayerInput } from 'src/engine/metadata-modules/serverless-function-layer/dtos/create-serverless-function-layer.input';
import { getLastCommonLayerDependencies } from 'src/engine/core-modules/serverless/drivers/utils/get-last-common-layer-dependencies';
import { serverlessFunctionCreateHash } from 'src/engine/metadata-modules/serverless-function/utils/serverless-function-create-hash.utils';

@Injectable()
export class ServerlessFunctionLayerService {
  constructor(
    @InjectRepository(ServerlessFunctionLayerEntity)
    private readonly serverlessFunctionLayerRepository: Repository<ServerlessFunctionLayerEntity>,
  ) {}

  async create(
    { packageJson, yarnLock }: CreateServerlessFunctionLayerInput,
    workspaceId: string,
  ) {
    const checksum = serverlessFunctionCreateHash(yarnLock);

    const serverlessFunctionLayer =
      this.serverlessFunctionLayerRepository.create({
        packageJson,
        yarnLock,
        checksum,
        workspaceId,
      });

    return this.serverlessFunctionLayerRepository.save(serverlessFunctionLayer);
  }

  async update(
    id: string,
    data: QueryDeepPartialEntity<ServerlessFunctionLayerEntity>,
  ) {
    const checksum = data.yarnLock
      ? serverlessFunctionCreateHash(data.yarnLock as string)
      : undefined;

    const updateData = { ...data, ...(checksum && { checksum }) };

    return this.serverlessFunctionLayerRepository.update(id, updateData);
  }

  async createCommonLayerIfNotExist(workspaceId: string) {
    const { packageJson, yarnLock } = await getLastCommonLayerDependencies();
    const checksum = serverlessFunctionCreateHash(yarnLock);
    const commonLayer = await this.serverlessFunctionLayerRepository.findOne({
      where: {
        checksum,
        workspaceId,
      },
    });

    if (isDefined(commonLayer)) {
      return commonLayer;
    }

    return this.create({ packageJson, yarnLock }, workspaceId);
  }
}
