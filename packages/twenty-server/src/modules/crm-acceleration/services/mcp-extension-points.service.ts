import { Injectable } from '@nestjs/common';

import { MCP_PROTOCOL_VERSION } from 'src/engine/api/mcp/constants/mcp-protocol-version.const';
import { MCP_SERVER_INFO } from 'src/engine/api/mcp/constants/mcp-server-info.const';

interface McpExtensionRequest {
  objectNames: string[];
}

@Injectable()
export class McpExtensionPointsService {
  getReadiness() {
    return {
      ready: true,
      protocolVersion: MCP_PROTOCOL_VERSION,
      serverName: MCP_SERVER_INFO.name,
      extensionPoints: [
        'tools/list',
        'tools/call',
        'get_tool_catalog',
        'learn_tools',
        'execute_tool',
        'load_skill',
      ],
    };
  }

  buildObjectExtensionPoints(request: McpExtensionRequest) {
    const extensions = request.objectNames.map((objectNameRaw) => {
      const objectName = objectNameRaw.trim().toLowerCase();

      return {
        objectName,
        endpoints: [
          `crm.${objectName}.list`,
          `crm.${objectName}.get`,
          `crm.${objectName}.create`,
          `crm.${objectName}.update`,
          `crm.${objectName}.delete`,
        ],
        recommendedScopes: [
          `${objectName}:read`,
          `${objectName}:write`,
          `${objectName}:admin`,
        ],
      };
    });

    return {
      generatedAt: new Date().toISOString(),
      extensions,
    };
  }
}
