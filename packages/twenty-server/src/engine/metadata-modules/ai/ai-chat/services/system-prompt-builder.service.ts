import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  getValidTimeZoneOrUndefined,
  tipTapDocumentToMarkdown,
} from 'twenty-shared/utils';

import { COMMON_PRELOAD_TOOLS } from 'src/engine/core-modules/tool-provider/constants/common-preload-tools.const';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { LOAD_SKILL_TOOL_NAME } from 'src/engine/core-modules/tool-provider/tools';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { buildToolCatalogSection } from 'src/engine/core-modules/tool-provider/utils/build-tool-catalog-section.util';
import {
  AgentActorContextService,
  type UserContext,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { CHAT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/ai/ai-chat/constants/chat-system-prompts.const';
import { type UploadedFileReference } from 'src/engine/metadata-modules/ai/ai-chat/types/uploaded-file-reference.type';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';

export type SystemPromptSection = {
  title: string;
  content: string;
  estimatedTokenCount: number;
};

export type SystemPromptPreview = {
  sections: SystemPromptSection[];
  estimatedTokenCount: number;
};

// ~4 characters per token for mixed English/code content
const estimateTokenCount = (text: string): number => Math.ceil(text.length / 4);

@Injectable()
export class SystemPromptBuilderService {
  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private readonly skillService: SkillService,
    private readonly agentActorContextService: AgentActorContextService,
  ) {}

  async buildPreview(
    workspaceId: string,
    userWorkspaceId: string,
    workspaceInstructions?: string,
  ): Promise<SystemPromptPreview> {
    const { roleId, userId, userContext } =
      await this.agentActorContextService.buildUserAndAgentActorContext(
        userWorkspaceId,
        workspaceId,
      );

    const toolCatalog = await this.toolRegistry.buildToolIndex(
      workspaceId,
      roleId,
      { userId, userWorkspaceId },
    );

    const skillCatalog = await this.skillService.findAllFlatSkills(workspaceId);

    const sections: SystemPromptSection[] = [];

    const baseContent = CHAT_SYSTEM_PROMPTS.BASE;

    sections.push({
      title: 'Base Instructions',
      content: baseContent,
      estimatedTokenCount: estimateTokenCount(baseContent),
    });

    const responseFormatContent = CHAT_SYSTEM_PROMPTS.RESPONSE_FORMAT;

    sections.push({
      title: 'Response Format',
      content: responseFormatContent,
      estimatedTokenCount: estimateTokenCount(responseFormatContent),
    });

    const workspaceSection = this.buildWorkspaceInstructionsSection(
      workspaceInstructions ?? '',
    );

    if (isNonEmptyString(workspaceSection)) {
      sections.push({
        title: 'Workspace Instructions',
        content: workspaceSection,
        estimatedTokenCount: estimateTokenCount(workspaceSection),
      });
    }

    if (userContext) {
      const userSection = this.buildUserContextSection(userContext);

      sections.push({
        title: 'User Context',
        content: userSection,
        estimatedTokenCount: estimateTokenCount(userSection),
      });
    }

    const toolSection = buildToolCatalogSection(
      toolCatalog,
      COMMON_PRELOAD_TOOLS,
    );

    sections.push({
      title: 'Tool Catalog',
      content: toolSection,
      estimatedTokenCount: estimateTokenCount(toolSection),
    });

    const skillSection = this.buildSkillCatalogSection(skillCatalog);

    if (skillSection) {
      sections.push({
        title: 'Skill Catalog',
        content: skillSection,
        estimatedTokenCount: estimateTokenCount(skillSection),
      });
    }

    const totalTokens = sections.reduce(
      (sum, section) => sum + section.estimatedTokenCount,
      0,
    );

    return {
      sections,
      estimatedTokenCount: totalTokens,
    };
  }

  buildFullPrompt(
    toolCatalog: ToolIndexEntry[],
    skillCatalog: FlatSkill[],
    preloadedTools: string[],
    uploadedFilesContext?: {
      uploadedFiles: UploadedFileReference[];
      codeInterpreterFiles: UploadedFileReference[];
    },
    workspaceInstructions?: string,
    userContext?: UserContext,
  ): string {
    const parts: string[] = [
      CHAT_SYSTEM_PROMPTS.BASE,
      CHAT_SYSTEM_PROMPTS.BROWSING_CONTEXT_INSTRUCTION,
      CHAT_SYSTEM_PROMPTS.RESPONSE_FORMAT,
    ];

    const workspaceInstructionsSection = this.buildWorkspaceInstructionsSection(
      workspaceInstructions ?? '',
    );

    if (isNonEmptyString(workspaceInstructionsSection)) {
      parts.push(workspaceInstructionsSection);
    }

    if (userContext) {
      parts.push(this.buildUserContextSection(userContext));
    }

    parts.push(buildToolCatalogSection(toolCatalog, preloadedTools));

    const skillSection = this.buildSkillCatalogSection(skillCatalog);

    if (skillSection) {
      parts.push(skillSection);
    }

    if (uploadedFilesContext && uploadedFilesContext.uploadedFiles.length > 0) {
      parts.push(this.buildUploadedFilesSection(uploadedFilesContext));
    }

    return parts.join('\n');
  }

  buildWorkspaceInstructionsSection(instructions: string): string {
    const projectedInstructions = tipTapDocumentToMarkdown(instructions).trim();

    if (!isNonEmptyString(projectedInstructions)) {
      return '';
    }

    return `
## Workspace Instructions

The following are custom instructions provided by the workspace administrator:

${projectedInstructions}`;
  }

  buildUserContextSection(userContext: UserContext): string {
    const parts = [
      `User: ${userContext.firstName} ${userContext.lastName}`.trim(),
    ];

    if (isNonEmptyString(userContext.jobTitle)) {
      parts.push(`Job title: ${userContext.jobTitle}`);
    }

    parts.push(`Locale: ${userContext.locale}`);

    const resolvedTimeZone = getValidTimeZoneOrUndefined(userContext.timezone);

    if (resolvedTimeZone) {
      parts.push(`Timezone: ${resolvedTimeZone}`);
    }

    parts.push(`Current date: ${this.formatCurrentDate(userContext.timezone)}`);

    return `
## User Context

${parts.join('\n')}`;
  }

  private formatCurrentDate(timezone: string | null): string {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: getValidTimeZoneOrUndefined(timezone),
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date());
  }

  buildUploadedFilesSection({
    uploadedFiles,
    codeInterpreterFiles,
  }: {
    uploadedFiles: UploadedFileReference[];
    codeInterpreterFiles: UploadedFileReference[];
  }): string {
    const uploadedFilesJson = JSON.stringify(
      uploadedFiles.map((f) => ({ filename: f.filename, fileId: f.fileId })),
    );

    const sectionParts = [
      `
## Uploaded Files

The user has uploaded the following files in this conversation:
\`\`\`json
${uploadedFilesJson}
\`\`\`

To store an uploaded file on a record, call \`prepare_uploaded_file\` first, then use the fieldValue it returns when creating or updating the record. A record cannot reference an uploaded fileId directly. For example, to attach a document to a person: call \`prepare_uploaded_file\` for the \`file\` field of the \`attachment\` object, then create an \`attachment\` record with that fieldValue and \`targetPersonId\`.`,
    ];

    if (codeInterpreterFiles.length > 0) {
      const codeInterpreterFilesJson = JSON.stringify(
        codeInterpreterFiles.map((f) => ({
          filename: f.filename,
          fileId: f.fileId,
        })),
      );

      sectionParts.push(`
**IMPORTANT**: Use the \`code_interpreter\` tool to analyze these files:
\`\`\`json
${codeInterpreterFilesJson}
\`\`\`

When calling code_interpreter, include the files parameter with these values (use fileId to reference uploaded files).
In your Python code, access files at \`/home/user/{filename}\`. Other uploaded files are not available in the sandbox.`);
    }

    return sectionParts.join('\n');
  }

  buildSkillCatalogSection(skillCatalog: FlatSkill[]): string {
    if (skillCatalog.length === 0) {
      return '';
    }

    const skillsList = skillCatalog
      .map(
        (skill) => `- \`${skill.name}\`: ${skill.description ?? skill.label}`,
      )
      .join('\n');

    return `
## Available Skills

Skills provide detailed expertise for specialized tasks. Load a skill before attempting complex operations.
To load a skill, call \`${LOAD_SKILL_TOOL_NAME}\` with the skill name(s).

${skillsList}`;
  }
}
