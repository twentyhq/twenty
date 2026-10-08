import { Injectable } from '@nestjs/common';

import { type Experimental_DownloadFunction } from 'ai';
import { FileFolder } from 'twenty-shared/types';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { buildAgentChatFileDownload } from 'src/engine/metadata-modules/ai/ai-history/utils/build-agent-chat-file-download.util';

@Injectable()
export class AgentChatFileDownloadService {
  constructor(
    private readonly fileService: FileService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  buildDownload(workspaceId: string): Experimental_DownloadFunction {
    return buildAgentChatFileDownload({
      serverUrl: this.twentyConfigService.get('SERVER_URL'),
      readAgentChatFile: (fileId) =>
        this.fileService.getFileContentById({
          fileId,
          workspaceId,
          fileFolder: FileFolder.AgentChat,
        }),
    });
  }
}
