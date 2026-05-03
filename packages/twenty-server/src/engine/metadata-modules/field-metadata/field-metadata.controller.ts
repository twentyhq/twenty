import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { FieldMetadataService } from './services/field-metadata.service';

@UseGuards(JwtAuthGuard)
@Controller('metadata/fields')
export class FieldMetadataController {
  constructor(
    private readonly fieldMetadataService: FieldMetadataService,
  ) {}

  @Get(':objectNameSingular/count')
  async getFieldCount(
    @Param('objectNameSingular') objectNameSingular: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<{ objectNameSingular: string; fieldCount: number }> {
    const count = await this.fieldMetadataService.getFieldCountForObject(
      workspace.id,
      objectNameSingular,
    );

    return {
      objectNameSingular,
      fieldCount: count,
    };
  }
}
