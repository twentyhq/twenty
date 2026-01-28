import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { LogicFunctionLayerEntity } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.entity';
import { CreateLogicFunctionLayerInput } from 'src/engine/metadata-modules/logic-function-layer/dtos/create-logic-function-layer.input';
import { getLastCommonLayerDependencies } from 'src/engine/core-modules/logic-function-executor/drivers/utils/get-last-common-layer-dependencies';
import { logicFunctionCreateHash } from 'src/engine/metadata-modules/logic-function/utils/logic-function-create-hash.utils';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class LogicFunctionLayerService {
  constructor(
    @InjectRepository(LogicFunctionLayerEntity)
    private readonly logicFunctionLayerRepository: Repository<LogicFunctionLayerEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async create(
    { packageJson, yarnLock }: CreateLogicFunctionLayerInput,
    workspaceId: string,
  ) {
    const checksum = logicFunctionCreateHash(yarnLock);

    const logicFunctionLayer = this.logicFunctionLayerRepository.create({
      packageJson,
      yarnLock,
      checksum,
      workspaceId,
    });

    const savedLayer =
      await this.logicFunctionLayerRepository.save(logicFunctionLayer);

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'logicFunctionLayerMaps',
    ]);

    return savedLayer;
  }

  async update(
    id: string,
    data: QueryDeepPartialEntity<LogicFunctionLayerEntity>,
    workspaceId: string,
  ) {
    const checksum = data.yarnLock
      ? logicFunctionCreateHash(data.yarnLock as string)
      : undefined;

    const updateData = { ...data, ...(checksum && { checksum }) };

    const result = await this.logicFunctionLayerRepository.update(
      id,
      updateData,
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'logicFunctionLayerMaps',
    ]);

    return result;
  }

  async createCommonLayerIfNotExist(workspaceId: string) {
    const { packageJson, yarnLock } = await getLastCommonLayerDependencies();
    const checksum = logicFunctionCreateHash(yarnLock);
    const commonLayer = await this.logicFunctionLayerRepository.findOne({
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
