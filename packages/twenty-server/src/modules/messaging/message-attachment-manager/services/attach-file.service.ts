import { Injectable } from '@nestjs/common';

import { FieldActorSource } from 'twenty-shared/types';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { SignedFilesResult } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';

@Injectable()
export class AttachFileService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async attachFile(
    uploadedFile: SignedFilesResult,
    workspaceId: string,
    fileCategory: string,
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const attachmentRepository =
          await this.globalWorkspaceOrmManager.getRepository<AttachmentWorkspaceEntity>(
            workspaceId,
            'attachment',
          );

        attachmentRepository.create({
          name: uploadedFile.name,
          fullPath: uploadedFile.files[0].path,
          fileCategory: fileCategory,
          createdBy: {
            name: 'WhatsApp',
            source: FieldActorSource.IMPORT,
            workspaceMemberId: null,
          },
          personId: '', // TODO: person or personId?
          messageId: '', // TODO: ???
        });
      },
    );
  }
}
