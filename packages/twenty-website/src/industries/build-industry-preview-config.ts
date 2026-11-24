import { type I18n } from '@lingui/core';

import {
  type AppPreviewConfig,
  type ColumnDef,
  type SidebarFolderDef,
  type SidebarPageItemDef,
  type TablePageDefinition,
  type WorkflowPageDefinition,
} from '@/app-preview/types';

import {
  type IndustryObject,
  type IndustryWorkflow,
  type ResolvedIndustryPage,
} from './industry-page-types';

const FIELD_COLUMN_WIDTH = 160;
const NAME_COLUMN_WIDTH = 200;
// The workflow canvas is authored around this vertical axis (app-preview
// workflow-data), so generated nodes line up with the homepage's.
const WORKFLOW_AXIS_X = 730;
const WORKFLOW_NODE_WIDTH = 320;
const WORKFLOW_FIRST_NODE_Y = 80;
const WORKFLOW_NODE_SPACING_Y = 130;

const STEP_ICON_NAMES = {
  trigger: 'plug',
  action: 'code',
  agent: 'sparkles',
} as const;

const toColumnId = (label: string): string =>
  label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// Objects without authored rows open as an empty view of their own fields,
// so every sidebar entry is navigable without inventing data for it.
const buildEmptyTablePage = (
  object: IndustryObject,
  label: string,
  i18n: I18n,
): TablePageDefinition => {
  const fieldColumns: ColumnDef[] = object.fields.map((field) => {
    const fieldLabel = i18n._(field.label);
    return {
      id: toColumnId(fieldLabel),
      label: fieldLabel,
      width: FIELD_COLUMN_WIDTH,
    };
  });

  return {
    type: 'table',
    header: { title: `All ${label}`, count: 0 },
    columns: [
      {
        id: 'name',
        label: 'Name',
        width: NAME_COLUMN_WIDTH,
        isFirstColumn: true,
      },
      ...fieldColumns,
    ],
    rows: [],
  };
};

const buildWorkflowPage = (
  workflow: IndustryWorkflow,
  title: string,
  i18n: I18n,
): WorkflowPageDefinition => {
  const nodes = workflow.steps.map((step, index) => ({
    id: `step-${index}`,
    x: WORKFLOW_AXIS_X - WORKFLOW_NODE_WIDTH / 2,
    y: WORKFLOW_FIRST_NODE_Y + index * WORKFLOW_NODE_SPACING_Y,
    width: WORKFLOW_NODE_WIDTH,
    label: step.kind === 'trigger' ? ('Trigger' as const) : ('Action' as const),
    title: i18n._(step.label),
    iconName: STEP_ICON_NAMES[step.kind],
    iconColor:
      step.kind === 'trigger' ? ('trigger' as const) : ('action' as const),
  }));

  return {
    type: 'workflow',
    header: { title },
    nodes,
    edges: nodes.slice(1).map((node, index) => ({
      from: nodes[index].id,
      to: node.id,
      type: 'vertical' as const,
    })),
  };
};

export const buildIndustryPreviewConfig = (
  page: ResolvedIndustryPage,
  i18n: I18n,
): AppPreviewConfig => {
  const { preview, customScreen } = page;

  const objectItems: SidebarPageItemDef[] = page.dataModel.objects.map(
    (object) => {
      const label = i18n._(object.label);
      const tablePage: TablePageDefinition =
        object.id === preview.tableObjectId
          ? {
              type: 'table',
              header: { title: preview.viewName, count: preview.rows.length },
              columns: preview.columns,
              rows: preview.rows,
            }
          : buildEmptyTablePage(object, label, i18n);

      return {
        id: object.id,
        label,
        icon: {
          kind: 'tabler',
          name: object.previewIcon,
          tone: object.previewTone,
        },
        page: tablePage,
      };
    },
  );

  const placedOn = page.dataModel.objects.find(
    (object) => object.id === customScreen.placedOn,
  );
  const recordItem: SidebarPageItemDef = {
    id: 'preview-record',
    label: preview.record.name,
    meta: placedOn ? i18n._(placedOn.label) : undefined,
    icon: {
      kind: 'avatar',
      label: preview.record.name.charAt(0),
      tone: placedOn?.previewTone ?? 'gray',
      shape: 'square',
    },
    page: {
      type: 'record',
      header: { title: preview.record.name },
      record: {
        name: preview.record.name,
        createdAt: preview.record.createdAt,
        fields: preview.record.fields,
        relations: [],
      },
      notes: [],
      widget: customScreen.preview,
    },
  };

  const workflowsFolder: SidebarFolderDef = {
    id: 'workflows',
    label: 'Workflows',
    icon: { kind: 'tabler', name: 'settingsAutomation', tone: 'gray' },
    items: page.workflows.items.map((workflow, index) => {
      const title = i18n._(workflow.title);
      return {
        id: `workflow-${index}`,
        label: title,
        icon: { kind: 'tabler', name: 'settingsAutomation', tone: 'gray' },
        page: buildWorkflowPage(workflow, title, i18n),
      };
    }),
  };

  return {
    defaultViewbarActions: ['Filter', 'Sort', 'Options'],
    sidebar: {
      workspaceName: preview.workspaceName,
      favorites: [recordItem],
      initialActiveItemId: preview.tableObjectId,
      initialOpenFolderIds: [],
      workspace: [...objectItems, workflowsFolder],
    },
  };
};
