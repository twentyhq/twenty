import { writeFileSync } from 'fs';

import { ToolCategory } from 'twenty-shared/ai';

import { type ToolExecutionRef } from 'src/engine/core-modules/tool-provider/types/tool-execution-ref.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { buildToolCatalogSection } from 'src/engine/core-modules/tool-provider/utils/build-tool-catalog-section.util';
import { CHAT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/ai/ai-chat/constants/chat-system-prompts.const';
import { WORKSPACE_SETUP_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-system-prompt.constant';
import { buildSkillCatalogSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-skill-catalog-section.util';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';

const OUTPUT_DIRECTORY =
  '/private/tmp/claude-501/-Users-raphaelbosi-Documents-Github-twenty--claude-worktrees-ai-onboarding-paths-e97397/aaf32ca8-87b1-41ee-b1b1-61fc4a1be543/scratchpad';

const ref = { kind: 'static' } as unknown as ToolExecutionRef;

const entry = (
  name: string,
  category: ToolCategory,
  objectName?: string,
  operation?: string,
): ToolIndexEntry => ({
  name,
  label: name,
  description: `${name} tool`,
  category,
  executionRef: ref,
  objectName,
  operation,
});

const OBJECTS = [
  'company',
  'person',
  'opportunity',
  'note',
  'task',
  'attachment',
  'message',
  'calendarEvent',
];
const OPS = [
  'find_many',
  'find_one',
  'group_by',
  'create_one',
  'create_many',
  'update_one',
  'update_many',
  'upsert_many',
  'delete_one',
  'delete_many',
];

const crudEntries = OBJECTS.flatMap((objectName) =>
  OPS.map((operation) =>
    entry(`${operation}_${objectName}`, ToolCategory.DATABASE_CRUD, objectName, operation),
  ),
);

const staticEntries = [
  ...['get_object_metadata', 'create_object_metadata', 'update_object_metadata', 'delete_object_metadata', 'create_many_object_metadata', 'update_many_object_metadata', 'get_field_metadata', 'create_field_metadata', 'update_field_metadata', 'delete_field_metadata', 'create_many_field_metadata', 'update_many_field_metadata', 'create_many_relation_fields'].map((n) => entry(n, ToolCategory.METADATA)),
  ...['get_views', 'get_view_query_parameters', 'upsert_complete_view', 'create_view', 'update_view', 'delete_view', 'get_view_fields', 'create_view_field', 'update_view_field', 'delete_view_field', 'create_many_view_fields', 'update_many_view_fields', 'get_view_filters', 'create_view_filter', 'create_many_view_filters', 'update_view_filter', 'delete_view_filter', 'get_view_sorts', 'create_view_sort', 'create_many_view_sorts', 'update_view_sort', 'delete_view_sort'].map((n) => entry(n, ToolCategory.VIEW)),
  ...['create_complete_workflow', 'create_workflow_version_step', 'update_workflow_version_step', 'update_workflow_version_trigger', 'delete_workflow_version_step', 'create_workflow_version_edge', 'delete_workflow_version_edge', 'create_draft_from_workflow_version', 'update_workflow_version_positions', 'activate_workflow_version', 'deactivate_workflow_version', 'compute_step_output_schema', 'get_workflow_current_version', 'list_workflows', 'delete_workflow', 'get_workflow_run', 'list_workflow_runs', 'validate_workflow'].map((n) => entry(n, ToolCategory.WORKFLOW)),
  ...['create_complete_dashboard', 'list_dashboards', 'get_dashboard', 'add_dashboard_tab', 'add_dashboard_widget', 'update_dashboard_widget', 'delete_dashboard_widget'].map((n) => entry(n, ToolCategory.DASHBOARD)),
  ...['list_roles', 'create_role', 'update_role', 'delete_role', 'assign_role_to_workspace_member', 'upsert_object_permissions', 'upsert_row_level_permission_rules'].map((n) => entry(n, ToolCategory.ROLE)),
  ...['create_navigation_menu_item', 'update_navigation_menu_item', 'delete_navigation_menu_item', 'list_navigation_menu_items'].map((n) => entry(n, ToolCategory.NAVIGATION_MENU_ITEM)),
  ...['create_webhook', 'update_webhook', 'delete_webhook', 'list_webhooks'].map((n) => entry(n, ToolCategory.WEBHOOK)),
  ...['http_request', 'send_email', 'draft_email', 'create_calendar_event', 'search_help_center', 'code_interpreter', 'navigate_app', 'extract_json_paths', 'search_output', 'save_campaign', 'app_exa_web_search'].map((n) => entry(n, ToolCategory.ACTION)),
];

const SKILLS: FlatSkill[] = ([
  ['workflow-building', 'Build, validate, and activate Twenty workflows step by step'],
  ['data-manipulation', 'Create, update, import, and bulk-edit records safely'],
  ['workspace-demo-seeding', 'Seed a workspace with coherent demo data'],
  ['dashboard-building', 'Compose dashboards with tabs and graph widgets'],
  ['metadata-building', 'Create and modify objects, fields, and relations'],
  ['research', 'Research companies and people on the web'],
  ['code-interpreter', 'Run Python for analysis and file processing'],
  ['xlsx', 'Read and produce Excel spreadsheets'],
  ['pdf', 'Read and produce PDF documents'],
  ['docx', 'Read and produce Word documents'],
  ['pptx', 'Read and produce PowerPoint decks'],
  ['view-building', 'Create and configure record views'],
  ['view-filters-and-sorts', 'Filter and sort record views correctly'],
  ['custom-objects-cleanup', 'Audit and clean up custom objects'],
  ['roles', 'Design roles and permission sets'],
] as const).map(
  ([name, description]) =>
    ({ name, label: name, description }) as unknown as FlatSkill,
);

const USER_CONTEXT_SECTION = `
## User Context

User: Camille Laurent
Job title: Operations Director
Locale: en
Timezone: Europe/Paris
Current date: Tuesday, August 18, 2026`;

describe('tmp dump prompt', () => {
  it('should dump catalog sections and the live-order system prompt', () => {
    const toolSection = buildToolCatalogSection(
      [...crudEntries, ...staticEntries],
      ['search_help_center', 'app_exa_web_search', 'ask_questions', 'complete_workspace_setup'],
    );
    const skillSection = buildSkillCatalogSection(SKILLS);

    writeFileSync(`${OUTPUT_DIRECTORY}/catalog-section.txt`, toolSection, 'utf-8');
    writeFileSync(`${OUTPUT_DIRECTORY}/skills-section.txt`, skillSection, 'utf-8');
    writeFileSync(
      `${OUTPUT_DIRECTORY}/system-prompt.txt`,
      [
        WORKSPACE_SETUP_SYSTEM_PROMPT,
        CHAT_SYSTEM_PROMPTS.RESPONSE_FORMAT,
        USER_CONTEXT_SECTION,
        toolSection,
        skillSection,
      ].join('\n'),
      'utf-8',
    );

    expect(toolSection.length).toBeGreaterThan(0);
  });
});
