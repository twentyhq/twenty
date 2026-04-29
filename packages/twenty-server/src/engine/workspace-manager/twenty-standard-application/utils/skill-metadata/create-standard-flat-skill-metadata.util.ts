import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { type AllStandardSkillName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-skill-name.type';
import {
  type CreateStandardSkillArgs,
  createStandardSkillFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/skill-metadata/create-standard-skill-flat-metadata.util';

export const STANDARD_FLAT_SKILL_METADATA_BUILDERS_BY_SKILL_NAME = {
  'workflow-building': (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'workflow-building',
        name: 'workflow-building',
        label: 'Workflow Building',
        description:
          'Creating and managing automation workflows with triggers and steps',
        icon: 'IconSettingsAutomation',
        content: `# Workflow Building Skill

You help users create and manage automation workflows.

## Capabilities

- Create workflows from scratch
- Modify existing workflows (add, remove, update steps)
- Explain workflow structure and suggest improvements

## Key Concepts

- **Triggers**: DATABASE_EVENT, MANUAL, CRON, WEBHOOK
- **Steps**: CREATE_RECORD, SEND_EMAIL, CODE, LOGIC_FUNCTION, etc.
- **Data flow**: Use {{stepId.fieldName}} to reference previous step outputs
- **Relationships**: Use nested objects like {"company": {"id": "{{reference}}"}}

## CRON Trigger Settings Schema

For CRON triggers, settings.type must be one of these exact values:

1. **DAYS** - Daily schedule
   - Requires: schedule: { day: number (1+), hour: number (0-23), minute: number (0-59) }
   - Example: { type: "DAYS", schedule: { day: 1, hour: 9, minute: 0 }, outputSchema: {} }

2. **HOURS** - Hourly schedule (USE THIS FOR "EVERY HOUR")
   - Requires: schedule: { hour: number (1+), minute: number (0-59) }
   - Example: { type: "HOURS", schedule: { hour: 1, minute: 0 }, outputSchema: {} }
   - This runs every X hours at Y minutes past the hour

3. **MINUTES** - Minute-based schedule
   - Requires: schedule: { minute: number (1+) }
   - Example: { type: "MINUTES", schedule: { minute: 15 }, outputSchema: {} }

4. **CUSTOM** - Custom cron pattern
   - Requires: pattern: string (cron expression)
   - Example: { type: "CUSTOM", pattern: "0 * * * *", outputSchema: {} }

## CODE Steps

Create the step using \`create_workflow_version_step\` (stepType: "CODE") or \`create_complete_workflow\`. This returns a step with a \`logicFunctionId\` in settings.input — the step starts with a default function, not the user's desired code.

## LOGIC_FUNCTION Steps

LOGIC_FUNCTION steps execute logic functions provided by installed applications. To add one:

1. Call \`list_logic_function_tools\` to discover available logic function tools with their IDs.
2. Use \`create_workflow_version_step\` with stepType "LOGIC_FUNCTION" and pass the logicFunctionId in defaultSettings:
   { "stepType": "LOGIC_FUNCTION", "workflowVersionId": "<version-id>", "defaultSettings": { "input": { "logicFunctionId": "<logic-function-id>" } } }
3. Or when using \`create_complete_workflow\`, include a step with type "LOGIC_FUNCTION" and settings.input.logicFunctionId.

## Critical Notes

Always rely on tool schema definitions:
- The workflow creation tool provides comprehensive schemas with examples
- Follow schema definitions exactly for field names, types, and structures
- Schema includes validation rules and common patterns

## Approach

- Ask clarifying questions to understand user needs
- List logic function tools. Present relevant ones to the user as options before defaulting to CODE steps.
- Suggest appropriate actions for the use case
- Explain each step and why it's needed
- For modifications, understand current structure first
- Ensure workflow logic remains coherent

Prioritize user understanding and workflow effectiveness.`,
        isCustom: false,
      },
    }),

  'data-manipulation': (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'data-manipulation',
        name: 'data-manipulation',
        label: 'Data Manipulation',
        description:
          'Searching, filtering, creating, and updating records across all objects',
        icon: 'IconDatabase',
        content: `# Data Manipulation Skill

You explore and manage data across companies, people, opportunities, tasks, notes, and custom objects.

## Capabilities

- Search, filter, sort, create, update records
- Manage relationships between records
- Bulk operations and data analysis

## Constraints

- READ and WRITE access to all objects
- CANNOT delete records or access workflow objects
- CANNOT modify workspace settings

## Multi-step Approach

- Chain queries to solve complex requests (e.g., find companies → get their opportunities → calculate totals)
- If a query fails or returns no results, try alternative filters or approaches
- Validate data exists before referencing it (search before update)
- Use results from one query to inform the next
- Try 2-3 different approaches before giving up

## Sorting (Critical)

For "top N" queries, use orderBy with limit:
- Examples: orderBy: [{"employees": "DescNullsLast"}], orderBy: [{"createdAt": "AscNullsFirst"}]
- Valid directions: "AscNullsFirst", "AscNullsLast", "DescNullsFirst", "DescNullsLast"

## Before Bulk Operations

- Confirm the scope and impact
- Explain what will change

Prioritize data integrity and provide clear feedback on operations performed.`,
        isCustom: false,
      },
    }),

  'workspace-demo-seeding': (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'workspace-demo-seeding',
        name: 'workspace-demo-seeding',
        label: 'Workspace Demo Seeding',
        description:
          'Seeding demo metadata and data for workspace setup and testing purposes',
        icon: 'IconDatabase',
        content: `# Workspace Demo Seeding Skill
You will transform the existing standard workspace into a fully custom demo tailored to the user's business type.

The goal is to tell a coherent and realistic story with the data: custom fields added to standard objects, new custom objects for domain-specific entities, rich relations, seeded and updated records, views, and enrichment data (emails, calendar events, tasks, notes, files) that make the workspace feel like a real company in operation.

## Object strategy

**Keep the standard objects — People, Companies, and Opportunities — and reuse their existing seed data.** They already have emails and calendar events linked to them as participants. The demo story is built on top of them, not instead of them.

- **People** → map to the domain's "contact" role (e.g. clients, candidates, customers, agents)
- **Companies** → map to the domain's "organisation" role (e.g. suppliers, agencies, employers)
- **Opportunities** → map to the domain's "deal/pipeline" role (e.g. job applications, deals, repair estimates)

**Add 2 to 3 additional custom objects** for domain-specific entities that don't map to People/Companies/Opportunities (e.g. Properties, Cars, Products, Projects). Keep the custom object count low — the standard objects carry most of the story.

**Add custom fields** to People, Companies, and Opportunities to enrich them with domain-specific data (e.g. add "specialisation", "licenseNumber" to People; add "industry vertical", "tier" to Companies; add "stage", "closeDate" to Opportunities).

Create rich relation fields between standard and custom objects to show off the relational capabilities of the platform.

If you have to create multiple things you *MUST* use the relevant create many tool if it exists:
- Use *create_many_object_metadata* to create all custom objects at once
- Use *create_many_field_metadata* to create all non-relation fields at once (including new fields on standard objects)
- Use *create_many_relation_fields* to create all relation fields between objects at once (do this AFTER creating the objects and non-relation fields)

If you have to wait use the navigate_app tool.

For the fields you will create, make sure to create a good variety of field types to showcase the different capabilities of the platform, for example:
- Create SELECT and SELECT_MULTIPLE field types for building demo board index views and table with groups views
- Create DATE_TIME fields to be able to create calendar views
- Create CURRENCY and NUMERIC fields for graphs

*Here are the steps to follow closely:*

STEP 0: Present a plan to the user and wait for approval.
- Use list_object_metadata_items to see all available objects in the workspace
- Use find_people (limit: 5) and find_companies (limit: 5) and find_opportunities (limit: 5) to understand the existing seed data shape
- Based on the user's business type, propose a plan that lists:
  - How People, Companies, and Opportunities map to the domain story (e.g. "People = Candidates", "Companies = Employers")
  - The 2–3 custom objects you will create, each with a one-line description of their role
  - The custom fields you will add to People, Companies, and Opportunities
  - A brief description of the key relations between objects
- Present this plan to the user and *wait for their confirmation or adjustments* before proceeding
- Once approved, call the custom-objects-cleanup skill to archive all existing custom objects without asking for user confirmation
- Wait 3 seconds after deletions for the backend side effects to be completed

STEP 1: Create all the custom objects at once with create_many_object_metadata
name must start with lowercase letter and contain only alphanumeric letters

STEP 2: Wait 3 seconds, for the backend side effects to be completed

STEP 3: Create all NON-RELATION fields for ALL objects by batch with create_many_field_metadata.
Do a separate batch call for each object.
This includes:
- New custom fields for the standard objects (Person, Company, Opportunity) — use their objectMetadataId from list_object_metadata_items
- All non-relation fields for the new custom objects
DO NOT include relation fields in this step. Only create TEXT, NUMBER, BOOLEAN, DATE_TIME, SELECT, MULTI_SELECT, CURRENCY, etc.
SELECT option values must be UPPER_SNAKE_CASE

STEP 4: Wait 3 seconds, for the backend side effects to be completed

STEP 5: Create all RELATION fields between objects at once with create_many_relation_fields
The name property should be camel-cased or the backend will throw, targetFieldLabel must be a string, targetFieldIcon must be a string, type must be one of the following values: MANY_TO_ONE, ONE_TO_MANY
targetFieldIcon is like IconSomething, it's ok if it doesn't exist in the icon library, it will just be a blank icon, but it needs to be a string that starts with Icon and is in PascalCase

STEP 6: Wait 3 seconds, for the backend side effects to be completed

STEP 7: Rename and enrich the first N records of People, Companies, and Opportunities.
- Use find_people (limit: 50, orderBy: [{ position: "AscNullsFirst" }]), find_companies (limit: 50, orderBy: [{ position: "AscNullsFirst" }]), find_opportunities (limit: 50, orderBy: [{ position: "AscNullsFirst" }]) to get the IDs of the first records in each table
  - Ordering by position ascending gives the earliest-inserted records, which are contiguous in the table — this keeps the demo data tightly grouped and makes the workspace feel coherent
- For each standard object, call update_people / update_companies / update_opportunities **individually per record** (one call per record) to set domain-relevant names and field values:
  - **People**: replace nameFirstName + nameLastName with realistic names that fit the domain role (e.g. for a law firm: "Sophie Martin", "James O'Brien"; for a clinic: "Dr. Clara Reyes", "Marco Bianchi"). Also set jobTitle to a domain-appropriate title.
  - **Companies**: replace name with realistic company names that fit the domain (e.g. for a law firm: "Ashford & Partners", "Nexus Legal Group"; for a clinic: "Meridian Health Clinic", "CarePoint Medical").
  - **Opportunities**: replace name with a domain-relevant deal name (e.g. "Q2 retainer — Ashford & Partners", "New patient intake — Meridian Health").
  - Also set the new custom fields on each record: spread realistic values across SELECT fields, set plausible CURRENCY/NUMERIC amounts, set DATE_TIME fields around TODAY.
- Do this one record at a time — the API does not support bulk individual updates with different values per record
- Wait 3 seconds after finishing all updates for one object type before moving to the next

STEP 7.5: Add view fields to the default views of standard objects to expose the new custom fields.
For each of People, Companies, and Opportunities:
- Navigate to the object's default view using the navigate_app tool
- Wait 3 seconds
- Use create_many_view_fields to add all the new custom fields to the default view so they are visible
  - Use decimal positions between 0 and 1 to insert them right after the label identifier field
- Navigate to the object's default view again using the navigate_app tool so the user can see the enriched records
- Wait 3 seconds

STEP 8: For each new custom object, repeat ALL of the following sub-steps before moving to the next object:
- Navigate the object's default view using the navigate_app tool
- Wait 3 seconds, so the user has time to see the object default view
- Create the view fields for the default view, use the create_many_view_fields tool, and make sure to include all created fields, including the relation fields, so that we have a complete view of the object with all its fields.
  BE CAREFUL to use a position that will put those view fields right after the first label identifier field
  which has a position of 0 and the next system created fields which begin at 1, *so use decimal positions between 0 and 1*
  *YOU MUST CREATE ALL VIEW FIELDS FOR ALL FIELDS, INCLUDING RELATION FIELDS, IN THIS STEP, DO NOT LEAVE ANY FIELD WITHOUT A VIEW FIELD, OTHERWISE IT WILL NOT BE VISIBLE IN THE DEFAULT VIEW AND THE USER WON'T KNOW IT EXISTS*

- **MANDATORY**: Navigate to the object's default view again using the navigate_app tool — YOU MUST DO THIS BEFORE EACH OBJECT'S DATA SEEDING, every single time, without exception
- Wait 3 seconds
- Seed relevant and realistic mock data for this object:
  - use the relevant tool to create many records for this object
  - between 20 and 50
  - with a coherent combination of values
  - link records to existing People and Companies using the relation fields you created
  - use dates that are around TODAY so it's relevant for seeing past / future and present records

- **MANDATORY**: Navigate to the object's default view again using the navigate_app tool so the user can see the populated data — DO NOT SKIP THIS, even if you already navigated earlier in this loop iteration
- Wait 3 seconds so the user has time to see the seeded records

- Then create 2 to 3 additional views for this object, one at a time. For each view, complete ALL of the following sub-steps before creating the next view:
  - Create the view using the create_view tool:
    - If the object has a SELECT field (e.g. status, stage, priority, type), create a **KANBAN** view grouped by that SELECT field with a relevant name like "By Status", "Pipeline", "By Priority".
      - Set kanbanAggregateOperation to COUNT so each column shows the number of records.
      - If there is a CURRENCY or NUMERIC field, also set kanbanAggregateOperationFieldName to that field for a SUM aggregate view.
    - If the object has a DATE or DATE_TIME field (e.g. dueDate, closedAt, scheduledAt), create a **CALENDAR** view and pass both \`calendarFieldName\` (that field name) and \`calendarLayout\` ("DAY", "WEEK", or "MONTH") with a relevant name like "Calendar", "Schedule", "Timeline".
    - Create a **TABLE** view with a meaningful group (mainGroupByFieldName set to a SELECT field) with a name like "By Type", "By Stage", "Grouped", or similar.
  - Use create_many_view_fields to add all relevant field columns to this view (using decimal positions between 0 and 1)
  - Add filters and sorts to this view:
    - **KANBAN views**: Sort by a CURRENCY or NUMERIC field DESC (biggest value first) if one exists, or by createdAt DESC. Add a filter to exclude archived/cancelled records if such a SELECT option exists.
    - **CALENDAR views**: Sort by the date field ASC (earliest events first). Add a filter using IS_IN_FUTURE or IS_RELATIVE to show only upcoming records by default.
    - **TABLE with groups**: Sort by createdAt DESC (most recent first) and add a filter on a meaningful field (e.g. status IS_NOT "CANCELLED", or amount GREATER_THAN_OR_EQUAL to some threshold that keeps ~80% of the records visible).
  - **MANDATORY**: Navigate to this view immediately using the navigate_app tool — YOU MUST DO THIS FOR EVERY SINGLE VIEW, right after its fields/filters/sorts are set up, without exception
  - Wait 3 seconds so the user can see the view and course-correct if needed

Also create additional views for the standard objects (People, Companies, Opportunities) that showcase the new custom fields:
- For People: a KANBAN view grouped by the new SELECT field you added (e.g. "By Specialisation", "By Status")
- For Opportunities: a KANBAN view grouped by the new stage/status field (pipeline view)
- For Companies: a TABLE view grouped by the new SELECT field
Navigate to each view after creating it. Wait 3 seconds.

Loop STEP 8 for all the custom objects

STEP 9: Create a multi-tab dashboard that tells the full story of the business.

Use create_complete_dashboard to create the first tab, then add_dashboard_tab + add_dashboard_widget for subsequent tabs.

**Structure: 3 tabs**

Tab 1 — "Overview": high-level KPIs and charts across the whole workspace
- Row 0: 3–4 AGGREGATE_CHART widgets (KPIs) — one per key metric (e.g. total revenue from Opportunities, count of active People, count of open deals). columnSpan 3–4, rowSpan 3.
- Row 3: 1–2 BAR_CHART or LINE_CHART widgets showing trends over time (group by a DATE_TIME field with MONTH granularity). columnSpan 6, rowSpan 7.
- Row 3: 1 PIE_CHART showing distribution by a SELECT field (e.g. status, type). columnSpan 6, rowSpan 7.
- Row 10: 1 STANDALONE_RICH_TEXT widget summarising the dashboard story. columnSpan 12, rowSpan 3.

Tab 2 — "[Domain object] pipeline" (e.g. "Deals", "Applications", "Repairs"): focus on Opportunities enriched with domain data
- Before adding the RECORD_TABLE widget, run this 3-step sequence:
  1. create_view (type TABLE, name e.g. "Active Deals") → get the new viewId
  2. create_many_view_fields on the new viewId — add 4–6 key fields (name, the new stage/status SELECT, a CURRENCY/NUMERIC field, a DATE field, linked Person or Company). Use positions 0, 1, 2… and isVisible: true.
  3. create_many_view_filters + create_view_sort — e.g. filter out CLOSED/LOST records (SELECT IS_NOT "CLOSED"), sort by value DESC
- Row 0: 1 RECORD_TABLE widget. Set objectMetadataId to Opportunity, configuration.viewId to the dedicated view. columnSpan 12, rowSpan 8.
- Row 8: 1 BAR_CHART grouped by the stage SELECT field. columnSpan 6, rowSpan 7.
- Row 8: 1 PIE_CHART or AGGREGATE_CHART on the CURRENCY field. columnSpan 6, rowSpan 7.

Tab 3 — "[Domain people role] list" (e.g. "Clients", "Candidates", "Contacts"): focus on People enriched with domain data
- Before adding the RECORD_TABLE widget, run this 3-step sequence:
  1. create_view (type TABLE, name e.g. "All Clients") → get the new viewId
  2. create_many_view_fields — add 4–5 key fields (name, email, the new SELECT/status field, a DATE field, linked Company)
  3. create_view_sort — sort by createdAt DESC or by name ASC
- Row 0: 1 RECORD_TABLE widget with the dedicated view. columnSpan 12, rowSpan 8.
- Row 8: 2–3 AGGREGATE_CHART KPIs (count, totals). columnSpan 4, rowSpan 3.
- Row 11: 1 BAR_CHART or LINE_CHART. columnSpan 12, rowSpan 7.

After creating the dashboard, navigate to the dashboard page.
`,
        isCustom: false,
      },
    }),

  'dashboard-building': (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'dashboard-building',
        name: 'dashboard-building',
        label: 'Dashboard Building',
        description:
          'Creating and managing dashboards with widgets and layouts',
        icon: 'IconLayoutDashboard',
        content: `# Dashboard Building Skill

You help users create and manage dashboards with widgets.

## Tools

- list_dashboards, get_dashboard
- create_complete_dashboard
- add_dashboard_tab, add_dashboard_widget, update_dashboard_widget, delete_dashboard_widget
- list_object_metadata_items (resolve object + field IDs)

## Graph Widget Workflow

1. Ask what data the user wants to visualize.
2. Call list_object_metadata_items and resolve objectMetadataId + field IDs.
3. Always call get_dashboard before modifying widgets.
4. Build the widget configuration using the rules below.
5. Call add_dashboard_widget or update_dashboard_widget. Use activeTabId from context if available.
6. Call get_dashboard to verify the final configuration.

## Field Resolution Rules

- All *MetadataId fields must be real UUIDs from metadata.
- Match by name or label, but write UUIDs into all *MetadataId fields.
- Subfield names use FIELD NAMES, not labels.
- Composite group-by requires a subfield (e.g. address → "addressCity").
- **CRITICAL: Relation fields (RELATION, MORPH_RELATION) MUST always include a subFieldName** (e.g. "name", "email", "stage"). Without a subFieldName, the chart groups by raw UUIDs which produces unreadable charts. Always pick a meaningful scalar field from the target object.

## Subfield Syntax

- Composite: \`address\` + \`addressCity\` → subFieldName "addressCity"
- Relation to scalar field: \`company.name\` → subFieldName "name" (only when target "name" is a simple TEXT/NUMBER field)
- Relation to composite field: \`owner.name\` where "name" is FULL_NAME → subFieldName must be "name.firstName" or "name.lastName" (NOT just "name")
- Relation + composite: \`company.address.addressCity\` → subFieldName "address.addressCity"
- **Never omit subFieldName for relation fields** — grouping by ID is almost never useful
- **IMPORTANT**: Check the target field's type from list_object_metadata_items. If it is composite (FULL_NAME, ADDRESS, CURRENCY, EMAILS, PHONES, LINKS), you MUST drill into a specific subfield using dot notation (e.g. "name.firstName", "address.addressCity", "emails.primaryEmail").

## User Language Notes

- "X axis" / "categories" → primaryAxisGroupByFieldMetadataId
- "Y axis" / "metric" → aggregateFieldMetadataId + aggregateOperation
- "Group by" / "stacking" / "colors" → secondaryAxisGroupByFieldMetadataId
- "Unstacked" / "remove group by" → clear secondaryAxisGroupByFieldMetadataId only
- "KPI" / "just a number" → AGGREGATE_CHART
- "Legend" → displayLegend
- "Data labels" → displayDataLabel
- "Hide empty values" → omitNullValues
- "Min range" / "Max range" → rangeMin / rangeMax
- "Running total" → isCumulative

## Graph Configuration Rules

- Use the tool schema as the source of truth for required/optional fields.
- Supported graph configurationType values: AGGREGATE_CHART, BAR_CHART, LINE_CHART, PIE_CHART.
- BAR_CHART and LINE_CHART use primaryAxisGroupByFieldMetadataId.
- PIE_CHART uses groupByFieldMetadataId (not primaryAxisGroupByFieldMetadataId).
- If any orderBy is MANUAL, include the matching manual sort array.
- If rangeMin and rangeMax are both set, rangeMin must be <= rangeMax.
- Set date granularity only when grouping by date fields.
- "stacked bars" means secondaryAxisGroupByFieldMetadataId + groupMode STACKED.
- "stacked lines" means isStacked true.

## Non-graph Widgets

- IFRAME: configurationType "IFRAME" + url
- STANDALONE_RICH_TEXT: configurationType "STANDALONE_RICH_TEXT" + body with markdown content
  - IMPORTANT: Put the actual text content in configuration.body.markdown, NOT in the widget title
  - Widget title should be a short label (e.g. "Notes", "Summary"), body.markdown holds the real content
- RECORD_TABLE: configurationType "RECORD_TABLE" — displays a filterable, sortable record list
  - **MANDATORY 3-step pre-sequence before creating the widget**:
    1. call create_view (type TABLE, name e.g. "Repairs Dashboard Table") → get the new viewId
    2. call create_many_view_fields on the new viewId — add 4–6 of the most relevant fields (label identifier + key SELECT/DATE/CURRENCY fields). Use positions 0, 1, 2… and isVisible: true.
    3. call create_many_view_filters and/or create_view_sort on the new viewId to focus the table (e.g. filter out DONE/CANCELLED records, sort by createdAt DESC or a date field ASC)
  - Never reuse a record index view — widget views and record index views must be separate
  - Set objectMetadataId on the widget (top-level, required)
  - Set configuration.viewId to the UUID of the dedicated view (required)
  - columnSpan 12 (full width) or 6 (half width), rowSpan 6–10

Example (STANDALONE_RICH_TEXT):
{
  "configurationType": "STANDALONE_RICH_TEXT",
  "body": { "markdown": "## Quarterly Summary\\n\\nKey metrics:\\n- Revenue up 15%\\n- 42 new deals closed\\n\\n**Next steps**: Focus on enterprise pipeline." }
}

Example (RECORD_TABLE — always run the 3-step pre-sequence first):
Step 1 — create_view: { "name": "Active Repairs", "objectNameSingular": "repair", "type": "TABLE" } → { "id": "<view-uuid>" }
Step 2 — create_many_view_fields: { "viewFields": [{ "viewId": "<view-uuid>", "fieldMetadataId": "<status-field-uuid>", "position": 1, "isVisible": true }, { "viewId": "<view-uuid>", "fieldMetadataId": "<amount-field-uuid>", "position": 2, "isVisible": true }] }
Step 3 — create_many_view_filters: { "filters": [{ "viewId": "<view-uuid>", "fieldMetadataId": "<status-field-uuid>", "operand": "IS_NOT", "value": "DONE" }] }
Step 3b — create_view_sort: { "viewId": "<view-uuid>", "fieldMetadataId": "<createdAt-field-uuid>", "direction": "DESC" }
Step 4 — add_dashboard_widget: { "type": "RECORD_TABLE", "objectMetadataId": "<repair-object-uuid>", "configuration": { "configurationType": "RECORD_TABLE", "viewId": "<view-uuid>" }, "gridPosition": { "row": 0, "column": 0, "rowSpan": 8, "columnSpan": 12 } }

## Tabs

Use add_dashboard_tab to create multiple tabs in a dashboard. Each tab has its own set of widgets.
Good tab structure: one overview tab (KPIs + charts) + one or more detail tabs (RECORD_TABLE + focused charts).
After creating a tab, use its returned tabId as pageLayoutTabId when calling add_dashboard_widget.

## Grid System

- 12 columns (0-11)
- KPI widgets: rowSpan 2-4, columnSpan 3-4
- Charts: rowSpan 6-8, columnSpan 6-12
- Record tables: rowSpan 6-10, columnSpan 6-12 (full-width preferred)
- Common layouts: 4 KPIs in a row (columnSpan 3), 2 charts side by side (columnSpan 6), full width chart or table (columnSpan 12)

## Best Practices

- Place KPIs at the top (row 0)
- Group related charts together
- Use consistent heights within rows
- Start simple, add complexity as needed
- When modifying a chart, confirm whether the user wants to change settings or change chart type
- Use RECORD_TABLE widgets to give users direct access to filtered record lists without leaving the dashboard`,
        isCustom: false,
      },
    }),

  'metadata-building': (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'metadata-building',
        name: 'metadata-building',
        label: 'Metadata Building',
        description:
          'Managing the data model: creating objects, fields, and relations',
        icon: 'IconBuildingSkyscraper',
        content: `# Metadata Building Skill

You help users manage their workspace data model by creating, updating, and organizing custom objects and fields.

## Capabilities

- Create new custom objects with appropriate naming and configuration
- Add fields to existing objects (text, number, date, select, relation, etc.)
- Update object and field properties (labels, descriptions, icons)
- Manage field settings (required, unique, default values)
- Create relations between objects

## Key Concepts

- **Objects**: Represent entities in the data model (e.g., Company, Person, Opportunity)
- **Fields**: Properties of objects with specific types (TEXT, NUMBER, DATE_TIME, SELECT, RELATION, etc.)
- **Relations**: Links between objects (one-to-many, many-to-one)
- **Labels vs Names**: Labels are for display, names are internal identifiers (camelCase)

## Field Types Available

- **TEXT**: Simple text fields
- **NUMBER**: Numeric values (integers or decimals)
- **BOOLEAN**: True/false values
- **DATE_TIME**: Date and time values
- **DATE**: Date only values
- **SELECT**: Single choice from options
- **MULTI_SELECT**: Multiple choices from options
- **LINK**: URL fields
- **LINKS**: Multiple URL fields
- **EMAIL**: Email address fields
- **EMAILS**: Multiple email fields
- **PHONE**: Phone number fields
- **PHONES**: Multiple phone fields
- **CURRENCY**: Monetary values
- **RATING**: Star ratings
- **RELATION**: Links to other objects
- **RICH_TEXT**: Formatted rich text content

## Best Practices

- Use clear, descriptive names for objects and fields
- Follow naming conventions: singular for object names, camelCase for field names
- Add helpful descriptions to objects and fields
- Choose appropriate field types for the data being stored
- Consider relationships between objects when designing the data model

## Approach

- Ask clarifying questions to understand the user's data modeling needs
- Suggest best practices for naming and organization
- Explain the impact of changes to the data model
- Verify object and field existence before making updates
- Provide clear feedback on operations performed

Prioritize data model integrity and user understanding.`,
        isCustom: false,
      },
    }),

  research: (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'research',
        name: 'research',
        label: 'Research',
        description: 'Finding information and gathering facts from the web',
        icon: 'IconSearch',
        content: `# Research Skill

You find information and gather facts from the web.

## Capabilities

- Search for current information and facts
- Research companies, people, technologies, trends
- Gather competitive intelligence and market data
- Find contact details and verify information

## Research Strategy

- Try multiple search queries from different angles
- If initial searches fail, use alternative search terms
- Cross-reference information when possible
- Cite sources and provide context

## Present Findings

- Be thorough but concise
- Organize information logically
- Distinguish facts from speculation
- Note if information might be outdated
- Include relevant sources

Be persistent in finding accurate information.`,
        isCustom: false,
      },
    }),

  'code-interpreter': (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'code-interpreter',
        name: 'code-interpreter',
        label: 'Code Interpreter',
        description:
          'Python code execution for data analysis, complex multi-step operations, and efficient bulk processing via MCP bridge',
        icon: 'IconCode',
        content: `# Code Interpreter Skill

You have access to the \`code_interpreter\` tool to execute Python code in a sandboxed environment.

## How to Use
Call the \`code_interpreter\` tool with your Python code. The tool will execute the code and return stdout, stderr, and any generated files.

## Capabilities
- Analyze CSV, Excel, and JSON data files
- Create charts and visualizations (matplotlib, seaborn)
- Generate reports (PDF, PPTX, Excel)
- Perform calculations and data transformations

## Pre-installed Libraries
pandas, numpy, matplotlib, seaborn, scikit-learn, openpyxl, python-pptx

## Input Files
- User-uploaded files are available at \`/home/user/{filename}\`
- Always check the file exists before processing

## Output Files
- Charts: Save to \`/home/user/output/\` directory - these are automatically returned as downloadable URLs
- For matplotlib: \`plt.savefig('/home/user/output/chart.png')\`
- Generated files: Save to \`/home/user/output/{filename}\`

## Example: Create a Bar Chart
\`\`\`python
import matplotlib.pyplot as plt
import os

# Data
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
sales = [100, 150, 200, 175, 250, 300]

# Create chart
plt.figure(figsize=(10, 6))
plt.bar(months, sales, color='skyblue')
plt.title('Monthly Sales')
plt.xlabel('Month')
plt.ylabel('Sales')
plt.tight_layout()

# Save to output directory
os.makedirs('/home/user/output', exist_ok=True)
plt.savefig('/home/user/output/sales_chart.png')
print('Chart saved!')
\`\`\`

## Example: Analyze CSV
\`\`\`python
import pandas as pd
import matplotlib.pyplot as plt
import os

# Load data
df = pd.read_csv('/home/user/data.csv')
print(f"Loaded {len(df)} rows")

# Create visualization
plt.figure(figsize=(10, 6))
df.groupby('category')['value'].mean().plot(kind='bar')
plt.title('Average Value by Category')
plt.tight_layout()

os.makedirs('/home/user/output', exist_ok=True)
plt.savefig('/home/user/output/analysis.png')
print('Analysis complete!')
\`\`\`

## Calling Twenty Tools from Python (MCP Bridge)

A \`twenty\` helper is automatically available in your code. Use it to call any Twenty tool directly from Python:

\`\`\`python
# Find records
people = twenty.call_tool('find_person_records', {'limit': 10})
print(f"Found {len(people['edges'])} people")

# Create a record
result = twenty.call_tool('create_company_record', {
    'data': {'name': 'Acme Corp', 'domainName': {'primaryLinkUrl': 'acme.com'}}
})
print(f"Created company: {result['id']}")

# Update a record
twenty.call_tool('update_person_record', {
    'id': 'person-uuid',
    'data': {'jobTitle': 'CEO'}
})

# List available tools
tools = twenty.list_tools()
for tool in tools:
    print(f"- {tool['name']}: {tool['description']}")
\`\`\`

This allows you to orchestrate complex multi-step operations in a single code execution, which is more efficient than multiple tool calls.`,
        isCustom: false,
      },
    }),

  xlsx: (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'xlsx',
        name: 'xlsx',
        label: 'Excel & Spreadsheets',
        description:
          'Excel/spreadsheet creation, editing, and analysis with formulas, formatting, and visualization',
        icon: 'IconFileSpreadsheet',
        content: `# Excel Processing Skill

**IMPORTANT**: Save all output files to \`/home/user/output/\` for them to be downloadable.

## Pre-installed Scripts

- \`python /home/user/scripts/xlsx/recalc.py <excel_file> [timeout]\` - Recalculate formulas using LibreOffice

## Requirements

### Zero Formula Errors
Every Excel model MUST be delivered with ZERO formula errors (#REF!, #DIV/0!, #VALUE!, #N/A, #NAME?)

### Use Formulas, Not Hardcoded Values
**Always use Excel formulas instead of calculating values in Python and hardcoding them.**

\`\`\`python
# ❌ WRONG - Hardcoding
total = df['Sales'].sum()
sheet['B10'] = total

# ✅ CORRECT - Using formulas
sheet['B10'] = '=SUM(B2:B9)'
\`\`\`

## Reading and Analyzing Data

\`\`\`python
import pandas as pd

# Read Excel
df = pd.read_excel('file.xlsx')
all_sheets = pd.read_excel('file.xlsx', sheet_name=None)  # All sheets as dict

# Analyze
df.head()
df.info()
df.describe()
\`\`\`

## Creating New Excel Files

\`\`\`python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

wb = Workbook()
sheet = wb.active

# Add data
sheet['A1'] = 'Hello'
sheet.append(['Row', 'of', 'data'])

# Add formula
sheet['B2'] = '=SUM(A1:A10)'

# Formatting
sheet['A1'].font = Font(bold=True)
sheet['A1'].fill = PatternFill('solid', start_color='FFFF00')
sheet['A1'].alignment = Alignment(horizontal='center')

# Column width
sheet.column_dimensions['A'].width = 20

wb.save('/home/user/output/output.xlsx')
\`\`\`

## Editing Existing Files

\`\`\`python
from openpyxl import load_workbook

wb = load_workbook('existing.xlsx')
sheet = wb.active

# Modify cells
sheet['A1'] = 'New Value'
sheet.insert_rows(2)

wb.save('/home/user/output/modified.xlsx')
\`\`\`

## Recalculating Formulas (MANDATORY)

After creating/editing files with formulas, run:
\`\`\`bash
python /home/user/scripts/xlsx/recalc.py /home/user/output/output.xlsx
\`\`\`

The script returns JSON with error details:
\`\`\`json
{
  "status": "success",
  "total_errors": 0,
  "total_formulas": 42,
  "error_summary": {}
}
\`\`\`

If errors found, fix them and recalculate again.

## Financial Model Color Coding

- **Blue text**: Hardcoded inputs
- **Black text**: Formulas and calculations
- **Green text**: Links from other worksheets
- **Yellow background**: Key assumptions needing attention

## Number Formatting

- Years: Format as text ("2024" not "2,024")
- Currency: Use $#,##0 format
- Percentages: 0.0% format
- Negatives: Use parentheses (123) not minus -123

## Quick Reference

| Task | Tool | Example |
|------|------|---------|
| Read Excel | pandas | \`pd.read_excel('file.xlsx')\` |
| Create Excel | openpyxl | \`Workbook()\` |
| Add formula | openpyxl | \`sheet['B2'] = '=SUM(A1:A10)'\` |
| Recalculate | script | \`python /home/user/scripts/xlsx/recalc.py file.xlsx\` |`,
        isCustom: false,
      },
    }),

  pdf: (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'pdf',
        name: 'pdf',
        label: 'PDF Processing',
        description:
          'PDF form filling, field extraction, table parsing, and validation',
        icon: 'IconFileTypePdf',
        content: `# PDF Processing Skill

**IMPORTANT**: Save all output files to \`/home/user/output/\` for them to be downloadable.

## Pre-installed Scripts

### Field Extraction
- \`python /home/user/scripts/pdf/extract_form_field_info.py <pdf_file>\` - Extract all fillable field names and types (JSON output)
- \`python /home/user/scripts/pdf/check_fillable_fields.py <pdf_file>\` - Check if PDF has fillable fields

### Form Filling
- \`python /home/user/scripts/pdf/fill_fillable_fields.py <pdf_file> <json_data> <output_file>\` - Fill PDF form fields
- \`python /home/user/scripts/pdf/fill_pdf_form_with_annotations.py <pdf_file> <json_data> <output_file>\` - Fill with annotation support

### Validation
- \`python /home/user/scripts/pdf/create_validation_image.py <pdf_file>\` - Create validation image of filled PDF
- \`python /home/user/scripts/pdf/check_bounding_boxes.py <pdf_file>\` - Check field boundaries
- \`python /home/user/scripts/pdf/convert_pdf_to_images.py <pdf_file>\` - Convert PDF pages to images

## Reading PDFs

\`\`\`python
import fitz  # PyMuPDF

# Open PDF
doc = fitz.open('document.pdf')

# Extract text from all pages
for page in doc:
    text = page.get_text()
    print(text)

# Extract text from specific page
page = doc[0]  # First page
text = page.get_text()
\`\`\`

## Extracting Tables

\`\`\`python
import pdfplumber

with pdfplumber.open('document.pdf') as pdf:
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                print(row)
\`\`\`

## Filling PDF Forms

### Step 1: Extract field information
\`\`\`bash
python /home/user/scripts/pdf/extract_form_field_info.py form.pdf > fields.json
\`\`\`

### Step 2: Create fill data JSON
\`\`\`json
{
  "field_name_1": "value1",
  "field_name_2": "value2",
  "checkbox_field": true
}
\`\`\`

### Step 3: Fill the form
\`\`\`bash
python /home/user/scripts/pdf/fill_fillable_fields.py form.pdf fill_data.json /home/user/output/output.pdf
\`\`\`

### Step 4: Validate the output
\`\`\`bash
python /home/user/scripts/pdf/create_validation_image.py /home/user/output/output.pdf
\`\`\`

## Creating PDFs

\`\`\`python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas('/home/user/output/output.pdf', pagesize=letter)
c.drawString(100, 750, 'Hello World!')
c.save()
\`\`\`

## Merging PDFs

\`\`\`python
from PyPDF2 import PdfMerger

merger = PdfMerger()
merger.append('file1.pdf')
merger.append('file2.pdf')
merger.write('/home/user/output/merged.pdf')
merger.close()
\`\`\`

## Splitting PDFs

\`\`\`python
from PyPDF2 import PdfReader, PdfWriter

reader = PdfReader('document.pdf')

# Extract specific pages
writer = PdfWriter()
writer.add_page(reader.pages[0])  # First page
writer.write('/home/user/output/page1.pdf')
\`\`\`

## Quick Reference

| Task | Tool | Command/Example |
|------|------|-----------------|
| Extract text | PyMuPDF | \`page.get_text()\` |
| Extract tables | pdfplumber | \`page.extract_tables()\` |
| List form fields | script | \`python extract_form_field_info.py form.pdf\` |
| Fill form | script | \`python fill_fillable_fields.py form.pdf data.json out.pdf\` |
| Validate fill | script | \`python create_validation_image.py filled.pdf\` |
| Create PDF | reportlab | \`canvas.Canvas('out.pdf')\` |
| Merge PDFs | PyPDF2 | \`PdfMerger()\` |`,
        isCustom: false,
      },
    }),

  docx: (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'docx',
        name: 'docx',
        label: 'Word Documents',
        description:
          'Word document creation, editing, template processing, and OOXML manipulation',
        icon: 'IconFileTypeDocx',
        content: `# Word Document Processing Skill

**IMPORTANT**: Save all output files to \`/home/user/output/\` for them to be downloadable.

## Pre-installed Scripts (OOXML Editing)

- \`python /home/user/scripts/docx/unpack.py <docx_file> <output_dir>\` - Unpack .docx to XML files for direct editing
- \`python /home/user/scripts/docx/pack.py <input_dir> <docx_file>\` - Repack XML files into .docx
- \`python /home/user/scripts/docx/validate.py <docx_file>\` - Validate document structure

### Validation Scripts
- \`/home/user/scripts/docx/validation/docx.py\` - DOCX validation module
- \`/home/user/scripts/docx/validation/redlining.py\` - Track changes/redline validation

## High-Level API (python-docx)

### Reading Documents

\`\`\`python
from docx import Document

doc = Document('document.docx')

# Read paragraphs
for para in doc.paragraphs:
    print(para.text)

# Read tables
for table in doc.tables:
    for row in table.rows:
        for cell in row.cells:
            print(cell.text)
\`\`\`

### Creating Documents

\`\`\`python
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()

# Add heading
doc.add_heading('Document Title', 0)

# Add paragraph with formatting
para = doc.add_paragraph('Normal text. ')
run = para.add_run('Bold text.')
run.bold = True

# Add table
table = doc.add_table(rows=2, cols=2)
table.cell(0, 0).text = 'Header 1'
table.cell(0, 1).text = 'Header 2'

# Add image
doc.add_picture('image.png', width=Inches(4))

doc.save('/home/user/output/output.docx')
\`\`\`

## Low-Level OOXML Editing

For complex edits (tracked changes, custom XML), use the unpack/edit/pack workflow:

### Step 1: Unpack
\`\`\`bash
python /home/user/scripts/docx/unpack.py document.docx ./unpacked/
\`\`\`

### Step 2: Edit XML directly
\`\`\`python
import xml.etree.ElementTree as ET

tree = ET.parse('./unpacked/word/document.xml')
root = tree.getroot()

# Edit XML...
# Namespaces: w = http://schemas.openxmlformats.org/wordprocessingml/2006/main

tree.write('./unpacked/word/document.xml', xml_declaration=True, encoding='UTF-8')
\`\`\`

### Step 3: Validate & Repack
\`\`\`bash
python /home/user/scripts/docx/validate.py ./unpacked/
python /home/user/scripts/docx/pack.py ./unpacked/ /home/user/output/output.docx
\`\`\`

## Template Processing

### Find and Replace
\`\`\`python
from docx import Document

doc = Document('template.docx')

for para in doc.paragraphs:
    if '{{name}}' in para.text:
        para.text = para.text.replace('{{name}}', 'John Doe')

doc.save('/home/user/output/filled.docx')
\`\`\`

### Preserve Formatting During Replace
\`\`\`python
def replace_in_paragraph(para, old_text, new_text):
    """Replace text while preserving formatting"""
    for run in para.runs:
        if old_text in run.text:
            run.text = run.text.replace(old_text, new_text)

for para in doc.paragraphs:
    replace_in_paragraph(para, '{{name}}', 'John Doe')
\`\`\`

## Working with Styles

\`\`\`python
from docx.shared import Pt, RGBColor

# Set font
run.font.name = 'Arial'
run.font.size = Pt(12)
run.font.color.rgb = RGBColor(0, 0, 0)

# Paragraph formatting
para.alignment = WD_ALIGN_PARAGRAPH.CENTER
para.paragraph_format.space_before = Pt(12)
para.paragraph_format.space_after = Pt(12)
\`\`\`

## Quick Reference

| Task | Tool | Example |
|------|------|---------|
| Read document | python-docx | \`Document('file.docx')\` |
| Create document | python-docx | \`Document()\` |
| Add heading | python-docx | \`doc.add_heading('Title', 0)\` |
| Add table | python-docx | \`doc.add_table(rows=2, cols=2)\` |
| Unpack for editing | script | \`python unpack.py doc.docx ./out/\` |
| Repack | script | \`python pack.py ./out/ doc.docx\` |
| Validate | script | \`python validate.py doc.docx\` |`,
        isCustom: false,
      },
    }),

  'view-building': (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'view-building',
        name: 'view-building',
        label: 'View Building',
        description:
          'Creating and configuring views (table, board/kanban, calendar) for objects to organize and visualize records',
        icon: 'IconLayoutBoard',
        content: `# View Building Skill

You help users create and configure views to organize how they see their records.

## View Types

- **TABLE**: Standard table/grid view. Works for any object. Default view type.
- **KANBAN**: Board view grouped by a SELECT field. Best for pipeline/status-based workflows.
- **CALENDAR**: Calendar view using a DATE or DATE_TIME field. Best for time-based records.

## Tools

- get_views - List existing views (filter by object name)
- create_view - Create a new view
- update_view - Update view name/icon
- delete_view - Delete a view
- create_many_view_fields - Add visible columns to a view
- update_many_view_fields - Update column configuration
- get_view_fields - List columns in a view
- list_object_metadata_items - Discover objects and their fields
- navigate_app - Navigate to a view after creation

## Workflow

1. **Identify the target object**: If the user didn't specify which object, ask them. Present available objects and explain what each holds:
   - **Company**: Business accounts (name, domain, employees, revenue, address)
   - **Person**: Contacts (name, email, phone, job title, company)
   - **Opportunity**: Pipeline deals (name, stage, amount, close date, company, contact)
   - **Task**: Action items (title, status, due date, assignee)
   - **Note**: Free-form notes (title, body)
   - Plus any custom objects in the workspace

2. **Choose the view type**: Suggest the best type based on the object's data:
   - TABLE: Good default for any object, great for browsing large datasets
   - KANBAN: Ideal when objects have a SELECT field representing stages/statuses (e.g., Opportunity → stage, Task → status)
   - CALENDAR: Ideal when objects have DATE/DATE_TIME fields (e.g., Opportunity → closeDate, Task → dueAt)

3. **Create the view**: Use create_view with the right parameters.
   - For KANBAN: The mainGroupByFieldName is required — ask user which SELECT field to group by, or suggest the most natural one.
   - For CALENDAR: You must provide both \`calendarFieldName\` (a DATE/DATE_TIME field name) and \`calendarLayout\` ("DAY", "WEEK", or "MONTH") when calling create_view.
   - For TABLE: No special configuration needed.

4. **Configure view fields**: Use create_many_view_fields to add relevant columns. Choose fields that make sense for the view's purpose. Use decimal positions between 0 and 1 to place them after the label identifier field.

5. **Navigate**: Use navigate_app to show the user their new view.

## KANBAN Best Practices

- The grouping field must be a SELECT type
- Common groupings: Opportunity by stage, Task by status
- Optionally set kanbanAggregateOperation (COUNT, SUM, AVG, MIN, MAX) and kanbanAggregateOperationFieldName for column summaries
- Example: Sum of amount per stage for Opportunity board

## CALENDAR Best Practices

- Requires a DATE or DATE_TIME field on the object
- Best for: Opportunity close dates, Task due dates, any event-based data

## TABLE with Groups

- TABLE views can also be grouped by a field using mainGroupByFieldName
- This creates collapsible sections in the table, organized by the grouping field values
- Works with SELECT fields for categorical grouping

## Approach

- If the user is vague (e.g., "create a board"), ask which object they want to see
- Suggest the most relevant view type based on the object's fields
- After creating a view, always configure useful view fields and navigate to it
- Explain what each view type does so users can make informed choices`,
        isCustom: false,
      },
    }),

  'view-filters-and-sorts': (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'view-filters-and-sorts',
        name: 'view-filters-and-sorts',
        label: 'View Filters & Sorts',
        description:
          'Adding filters and sorts to views to focus on relevant records based on user needs',
        icon: 'IconFilter',
        content: `# View Filters & Sorts Skill

You help users add filters and sorts to their views so they see the most relevant records.

## Tools

- get_views - List existing views to find the one to modify
- get_view_query_parameters - Check existing filters and sorts on a view
- list_object_metadata_items - Discover fields and their types to build valid filters
- create_view_filter / create_many_view_filters - Add filters to a view
- create_view_sort / create_many_view_sorts - Add sorts to a view
- navigate_app - Navigate to the view to show results

## Filter Operators by Field Type

| Field Type | Available Operators |
|---|---|
| TEXT, EMAILS, FULL_NAME, ADDRESS, LINKS, PHONES | CONTAINS, DOES_NOT_CONTAIN, IS_EMPTY, IS_NOT_EMPTY |
| NUMBER, NUMERIC | IS, IS_NOT, GREATER_THAN_OR_EQUAL, LESS_THAN_OR_EQUAL, IS_EMPTY, IS_NOT_EMPTY |
| CURRENCY | GREATER_THAN_OR_EQUAL, LESS_THAN_OR_EQUAL, IS_EMPTY, IS_NOT_EMPTY |
| DATE, DATE_TIME | IS, IS_RELATIVE, IS_IN_PAST, IS_IN_FUTURE, IS_TODAY, IS_BEFORE, IS_AFTER, IS_EMPTY, IS_NOT_EMPTY |
| SELECT | IS, IS_NOT, IS_EMPTY, IS_NOT_EMPTY |
| MULTI_SELECT, ARRAY | CONTAINS, DOES_NOT_CONTAIN, IS_EMPTY, IS_NOT_EMPTY |
| RELATION | IS, IS_NOT, IS_EMPTY, IS_NOT_EMPTY |
| BOOLEAN | IS |

## Sort Directions

- ASC: Ascending (A→Z, 0→9, oldest→newest)
- DESC: Descending (Z→A, 9→0, newest→oldest)

## Filter Groups (AND/OR/NOT)

Filters can be grouped with logical operators:
- **AND**: All filters must match (default)
- **OR**: At least one filter must match
- **NOT**: Negate the group
- Groups can be nested for complex conditions like: name CONTAINS "tech" AND (revenue > 1M OR employees > 100)

## Workflow

1. **Identify the view**: If the user didn't specify a view, ask which view they want to filter/sort. Use get_views to list available views and present them.

2. **Understand the need**: If the user hasn't described what they want to see, ask them. Give guidance with examples:
   - "What records do you want to focus on? For example:"
   - "Show only high-value opportunities (amount > $50K)"
   - "Show companies in a specific city or industry"
   - "Show tasks due this week, sorted by priority"
   - "Show people from a specific company"
   - "Show recent records created in the last 30 days"

3. **Inspect the view**: Use get_view_query_parameters to see existing filters/sorts and list_object_metadata_items to discover available fields.

4. **Build filters**: Based on the user's need, determine:
   - Which field(s) to filter on
   - Which operator is valid for that field type (see table above)
   - What value to filter by
   - Whether to use AND or OR grouping for multiple filters

5. **Build sorts**: Determine:
   - Which field to sort by (most relevant to the user's goal)
   - Direction: ASC or DESC
   - Multiple sorts can be added (primary, secondary, etc.)

6. **Apply and navigate**: Create the filters/sorts on the view and navigate to it.

## Common Filter Patterns

### By Time
- Recent records: DATE_TIME field + IS_AFTER + a date value
- Upcoming deadlines: DATE field + IS_IN_FUTURE
- Overdue tasks: DATE field + IS_IN_PAST + status IS_NOT "DONE"
- This week/month: DATE field + IS_RELATIVE

### By Status/Stage
- Open opportunities: stage IS "IN_PROGRESS" or IS_NOT "WON"/"LOST"
- Active tasks: status IS_NOT "DONE"

### By Relationship
- Records linked to a company: company relation IS [specific company]
- Unassigned tasks: assignee IS_EMPTY
- Orphaned records: relation field IS_EMPTY

### By Value
- High-value deals: amount GREATER_THAN_OR_EQUAL threshold
- Large companies: employees GREATER_THAN_OR_EQUAL threshold

## Common Sort Patterns

- Pipeline view: Sort by amount DESC (biggest deals first)
- Task management: Sort by dueAt ASC (earliest due first)
- Recent activity: Sort by updatedAt DESC or createdAt DESC
- Alphabetical: Sort by name ASC

## Composite Fields

Some fields have sub-fields that can be filtered:
- CURRENCY: Use subFieldName "amountMicros" for the numeric value
- ADDRESS: Use subFieldName like "addressCity", "addressCountry"
- FULL_NAME: Use subFieldName like "firstName", "lastName"
- EMAILS: Use the primary email
- LINKS: Use the primary link URL

## Approach

- Always check field types before suggesting operators — using an invalid operator for a field type will fail
- When the user says "show me X", translate that into the appropriate filter logic
- Suggest sorts that complement the filters (e.g., if filtering overdue tasks, sort by dueAt ASC)
- Explain what the filters do so users understand the results
- If complex filtering is needed (AND + OR), explain the logic clearly`,
        isCustom: false,
      },
    }),

  'custom-objects-cleanup': (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'custom-objects-cleanup',
        name: 'custom-objects-cleanup',
        label: 'Custom Objects Cleanup',
        description:
          'Archiving custom objects from a workspace (e.g. dev seed objects like pets, rockets)',
        icon: 'IconArchive',
        content: `# Custom Objects Cleanup Skill

You help users archive custom objects from their workspace, such as objects created by the dev seed (pets, rockets, survey results, etc.) or any other custom objects.

## Tools

- list_object_metadata_items - List all objects in the workspace to identify custom ones
- update_many_object_metadata - Archive custom objects by setting isActive to false

## Workflow

1. **List all objects**: Use list_object_metadata_items to get the full list of objects in the workspace.

2. **Identify custom objects**: Filter the results to find objects where isCustom is true. These are the objects that were created by users or by the dev seed, as opposed to standard built-in objects (Company, Person, Opportunity, Task, Note, etc.).

3. **Present findings**: Tell the user which custom objects were found. If none are found, inform the user that the workspace has no custom objects.

4. **Confirm before archiving**: List the custom objects you found and ask the user to confirm which ones they want to archive. Present them clearly with their name, label, and description.

5. **Archive confirmed objects**: Use update_many_object_metadata to set isActive to false on all confirmed objects in a single batch call.

6. **Report results**: After archiving is complete, summarize what was archived.

## Important Notes

- Only objects with isCustom = true can be archived. Standard objects cannot be archived through this skill.
- Archiving an object hides it from the workspace but does not delete its fields, relations, or records.
- When called directly by a user, confirm before archiving. When called by another skill (e.g. workspace-demo-seeding), proceed without confirmation.

## Approach

- Be clear about what will be archived and that it is reversible
- If an object has relations to other objects, mention this before archiving
- Archive all confirmed objects in a single batch call using update_many_object_metadata`,
        isCustom: false,
      },
    }),

  pptx: (args: Omit<CreateStandardSkillArgs, 'context'>) =>
    createStandardSkillFlatMetadata({
      ...args,
      context: {
        skillName: 'pptx',
        name: 'pptx',
        label: 'PowerPoint',
        description:
          'PowerPoint creation, editing, templates, thumbnails, and slide manipulation',
        icon: 'IconPresentation',
        content: `# PowerPoint Processing Skill

**IMPORTANT**: Save all output files to \`/home/user/output/\` for them to be downloadable.

## Pre-installed Scripts

- \`python /home/user/scripts/pptx/thumbnail.py <pptx_file> [output_dir]\` - Generate slide thumbnails
- \`python /home/user/scripts/pptx/rearrange.py <pptx_file> <slide_order_json> <output_file>\` - Reorder slides
- \`python /home/user/scripts/pptx/inventory.py <pptx_file>\` - List all slides and their content
- \`python /home/user/scripts/pptx/replace.py <pptx_file> <replacements_json> <output_file>\` - Find/replace text

## Reading Presentations

\`\`\`python
from pptx import Presentation

prs = Presentation('presentation.pptx')

# Iterate through slides
for slide in prs.slides:
    for shape in slide.shapes:
        if shape.has_text_frame:
            print(shape.text)
\`\`\`

## Creating Presentations

\`\`\`python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()

# Add title slide
slide_layout = prs.slide_layouts[0]  # Title layout
slide = prs.slides.add_slide(slide_layout)
title = slide.shapes.title
subtitle = slide.placeholders[1]

title.text = "Presentation Title"
subtitle.text = "Subtitle goes here"

# Add content slide
slide_layout = prs.slide_layouts[1]  # Title and content
slide = prs.slides.add_slide(slide_layout)
title = slide.shapes.title
body = slide.placeholders[1]

title.text = "Slide Title"
tf = body.text_frame
tf.text = "First bullet"
p = tf.add_paragraph()
p.text = "Second bullet"
p.level = 1

prs.save('/home/user/output/output.pptx')
\`\`\`

## Adding Images

\`\`\`python
from pptx.util import Inches

slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank layout
slide.shapes.add_picture(
    'image.png',
    left=Inches(1),
    top=Inches(1),
    width=Inches(5)
)
\`\`\`

## Adding Tables

\`\`\`python
from pptx.util import Inches

slide = prs.slides.add_slide(prs.slide_layouts[6])
table = slide.shapes.add_table(
    rows=3, cols=3,
    left=Inches(1), top=Inches(1),
    width=Inches(8), height=Inches(2)
).table

# Set cell values
table.cell(0, 0).text = "Header 1"
table.cell(0, 1).text = "Header 2"
table.cell(1, 0).text = "Data 1"
\`\`\`

## Adding Charts

\`\`\`python
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE
from pptx.util import Inches

chart_data = CategoryChartData()
chart_data.categories = ['East', 'West', 'Midwest']
chart_data.add_series('Series 1', (19.2, 21.4, 16.7))

slide = prs.slides.add_slide(prs.slide_layouts[6])
chart = slide.shapes.add_chart(
    XL_CHART_TYPE.COLUMN_CLUSTERED,
    Inches(1), Inches(1), Inches(8), Inches(5),
    chart_data
).chart
\`\`\`

## Using Scripts

### Generate Thumbnails
\`\`\`bash
python /home/user/scripts/pptx/thumbnail.py presentation.pptx ./thumbnails/
# Creates: thumbnails/slide_1.png, slide_2.png, etc.
\`\`\`

### Get Slide Inventory
\`\`\`bash
python /home/user/scripts/pptx/inventory.py presentation.pptx
# Returns JSON with all slide content and shapes
\`\`\`

### Reorder Slides
\`\`\`bash
# Order: [3, 1, 2] means slide 3 becomes first, slide 1 second, etc.
python /home/user/scripts/pptx/rearrange.py input.pptx '[3, 1, 2]' output.pptx
\`\`\`

### Find and Replace Text
\`\`\`bash
python /home/user/scripts/pptx/replace.py input.pptx '{"{{company}}": "Acme Corp", "{{date}}": "2024"}' output.pptx
\`\`\`

## Template Processing Workflow

1. **Generate thumbnails** to understand slide structure:
   \`\`\`bash
   python /home/user/scripts/pptx/thumbnail.py template.pptx ./preview/
   \`\`\`

2. **Get inventory** to find placeholder text:
   \`\`\`bash
   python /home/user/scripts/pptx/inventory.py template.pptx
   \`\`\`

3. **Replace placeholders**:
   \`\`\`bash
   python /home/user/scripts/pptx/replace.py template.pptx '{"{{title}}": "Q4 Report"}' output.pptx
   \`\`\`

## Quick Reference

| Task | Tool | Example |
|------|------|---------|
| Read presentation | python-pptx | \`Presentation('file.pptx')\` |
| Create presentation | python-pptx | \`Presentation()\` |
| Add slide | python-pptx | \`prs.slides.add_slide(layout)\` |
| Generate thumbnails | script | \`python thumbnail.py pres.pptx ./out/\` |
| Get slide inventory | script | \`python inventory.py pres.pptx\` |
| Reorder slides | script | \`python rearrange.py pres.pptx '[2,1,3]' out.pptx\` |
| Find/replace | script | \`python replace.py pres.pptx '{...}' out.pptx\` |`,
        isCustom: false,
      },
    }),
} satisfies {
  [P in AllStandardSkillName]: (
    args: Omit<CreateStandardSkillArgs, 'context'>,
  ) => FlatSkill;
};
