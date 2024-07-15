import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileUpload } from 'graphql-upload';
import { Repository } from 'typeorm';

import { CustomCodeEngineService } from 'src/engine/core-modules/custom-code-engine/custom-code-engine.service';
import {
  FunctionMetadataEntity,
  FunctionSyncStatus,
} from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';
import {
  FunctionMetadataException,
  FunctionMetadataExceptionCode,
} from 'src/engine/metadata-modules/function-metadata/function-metadata.exception';

@Injectable()
export class FunctionMetadataService {
  constructor(
    private readonly customCodeEngineService: CustomCodeEngineService,
    @InjectRepository(FunctionMetadataEntity, 'metadata')
    private readonly functionMetadataRepository: Repository<FunctionMetadataEntity>,
  ) {}

  async executeFunction(
    name: string,
    workspaceId,
    payload: object | undefined = undefined,
  ) {
    const functionToExecute = await this.functionMetadataRepository.findOne({
      where: {
        name,
        workspaceId,
      },
    });

    if (!functionToExecute) {
      throw new FunctionMetadataException(
        `Function does not exist`,
        FunctionMetadataExceptionCode.FUNCTION_NOT_FOUND,
      );
    }

    return this.customCodeEngineService.execute(functionToExecute, payload);
  }

  async createOne(name: string, workspaceId: string, file: FileUpload) {
    const functionMetadata = await this.functionMetadataRepository.findOne({
      where: { name, workspaceId },
    });

    if (functionMetadata) {
      throw new FunctionMetadataException(
        `Function already exists`,
        FunctionMetadataExceptionCode.FUNCTION_ALREADY_EXIST,
      );
    }

    const { sourceCodePath, buildSourcePath } =
      await this.customCodeEngineService.generateExecutable(
        name,
        workspaceId,
        file,
      );

    return await this.functionMetadataRepository.save({
      name,
      workspaceId,
      sourceCodePath,
      buildSourcePath,
      syncStatus: FunctionSyncStatus.READY,
    });
  }
}
