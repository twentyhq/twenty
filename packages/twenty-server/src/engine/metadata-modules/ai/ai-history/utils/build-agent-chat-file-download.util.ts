import {
  createDownload,
  DownloadError,
  type Experimental_DownloadFunction,
} from 'ai';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

type AgentChatFileContent = { buffer: Buffer; mimeType: string };

const defaultDownload = createDownload();

const extractAgentChatFileId = ({
  url,
  serverUrl,
}: {
  url: URL;
  serverUrl: string;
}): string | null => {
  const agentChatFileBaseUrl = new URL(
    `${serverUrl}/file/${FileFolder.AgentChat}/`,
  );

  if (
    url.origin !== agentChatFileBaseUrl.origin ||
    !url.pathname.startsWith(agentChatFileBaseUrl.pathname)
  ) {
    return null;
  }

  const fileId = url.pathname.slice(agentChatFileBaseUrl.pathname.length);

  return isValidUuid(fileId) ? fileId : null;
};

// The AI SDK refuses to download private or loopback URLs, which a self-hosted SERVER_URL often is
export const buildAgentChatFileDownload = ({
  serverUrl,
  readAgentChatFile,
}: {
  serverUrl: string;
  readAgentChatFile: (fileId: string) => Promise<AgentChatFileContent | null>;
}): Experimental_DownloadFunction => {
  return (requestedDownloads) =>
    Promise.all(
      requestedDownloads.map(async ({ url, isUrlSupportedByModel }) => {
        if (isUrlSupportedByModel) {
          return null;
        }

        const fileId = extractAgentChatFileId({ url, serverUrl });

        if (!isDefined(fileId)) {
          return defaultDownload({ url });
        }

        const file = await readAgentChatFile(fileId);

        if (!isDefined(file)) {
          throw new DownloadError({
            url: url.toString(),
            message: `Agent chat file ${fileId} not found`,
          });
        }

        return { data: new Uint8Array(file.buffer), mediaType: file.mimeType };
      }),
    );
};
