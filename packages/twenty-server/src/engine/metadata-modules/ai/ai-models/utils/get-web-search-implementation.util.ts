import { type AiSdkPackage } from 'twenty-shared/ai';

import { EXA_WEB_SEARCH_TOOL_NAME } from 'src/engine/core-modules/tool-provider/constants/exa-web-search-tool-name.const';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { type WebSearchImplementation } from 'src/engine/metadata-modules/ai/ai-models/types/web-search-implementation.type';
import { getNativeModelToolsForSdkPackage } from 'src/engine/metadata-modules/ai/ai-models/utils/get-native-model-tools-for-sdk-package.util';

export const getWebSearchImplementation = ({
  sdkPackage,
  toolCatalog,
}: {
  sdkPackage?: AiSdkPackage | null;
  toolCatalog: Pick<ToolIndexEntry, 'name'>[];
}): WebSearchImplementation | undefined => {
  const hasExaWebSearchTool = toolCatalog.some(
    (tool) => tool.name === EXA_WEB_SEARCH_TOOL_NAME,
  );

  if (hasExaWebSearchTool) {
    // Installed Exa owns web search so execution stays consistent across models.
    return 'exa';
  }

  const nativeWebSearchTool =
    getNativeModelToolsForSdkPackage(sdkPackage)?.webSearch;

  return nativeWebSearchTool ? 'native' : undefined;
};
