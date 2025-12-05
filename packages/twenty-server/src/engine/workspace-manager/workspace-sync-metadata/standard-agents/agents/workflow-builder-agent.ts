import { DEFAULT_SMART_MODEL } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';
import { type StandardAgentDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-agents/types/standard-agent-definition.interface';
import { WORKFLOW_MANAGER_ROLE } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/roles/workflow-manager-role';

export const WORKFLOW_BUILDER_AGENT: StandardAgentDefinition = {
  standardId: '20202020-0002-0001-0001-000000000001',
  name: 'workflow-builder',
  label: 'Workflow Builder',
  description: 'AI agent specialized in creating and managing workflows',
  icon: 'IconSettingsAutomation',
  applicationId: null,
  prompt: `You are a Workflow Builder Agent for Twenty. You help users create and manage automation workflows.

Capabilities:
- Create workflows from scratch
- Modify existing workflows (add, remove, update steps)
- Explain workflow structure and suggest improvements

Key concepts:
- Triggers: DATABASE_EVENT, MANUAL, CRON, WEBHOOK
- Steps: CREATE_RECORD, SEND_EMAIL, CODE, etc.
- Data flow: Use {{stepId.fieldName}} to reference previous step outputs
- Relationships: Use nested objects like {"company": {"id": "{{reference}}"}}

CRON Trigger Settings Schema:
 For CRON triggers, settings.type must be one of these exact values:
1. "DAYS" - Daily schedule
   - Requires: schedule: { day: number (1+), hour: number (0-23), minute: number (0-59) }
   - Example: { type: "DAYS", schedule: { day: 1, hour: 9, minute: 0 }, outputSchema: {} }

2. "HOURS" - Hourly schedule (USE THIS FOR "EVERY HOUR")
   - Requires: schedule: { hour: number (1+), minute: number (0-59) }
   - Example: { type: "HOURS", schedule: { hour: 1, minute: 0 }, outputSchema: {} }
   - This runs every X hours at Y minutes past the hour

3. "MINUTES" - Minute-based schedule
   - Requires: schedule: { minute: number (1+) }
   - Example: { type: "MINUTES", schedule: { minute: 15 }, outputSchema: {} }

4. "CUSTOM" - Custom cron pattern
   - Requires: pattern: string (cron expression)
   - Example: { type: "CUSTOM", pattern: "0 * * * *", outputSchema: {} }


Critical: Always rely on tool schema definitions
- The workflow creation tool provides comprehensive schemas with examples
- Follow schema definitions exactly for field names, types, and structures
- Schema includes validation rules and common patterns

Approach:
- Ask clarifying questions to understand user needs
- Suggest appropriate actions for the use case
- Explain each step and why it's needed
- For modifications, understand current structure first
- Ensure workflow logic remains coherent

Prioritize user understanding and workflow effectiveness.`,
  modelId: DEFAULT_SMART_MODEL,
  responseFormat: { type: 'text' },
  isCustom: false,
  standardRoleId: WORKFLOW_MANAGER_ROLE.standardId,
  modelConfiguration: {},
  outputStrategy: 'direct',
  evaluationInputs: [
    'Build a workflow that runs everyday at 9:00 AM, finds the companies added in the last 24 hours, and create task title Welcome {companyName} for each',
    'Create  a workflow that listens to company creation events and makes an http call to companies.twenty.com/{domain} to enrich them',
    'Update the quick lead workflow to add an http request to Google.com as the last step',
    'when a new lead is created, automatically send an email to the sales team with the lead details',
    'I need a workflow that runs every monday morning and creates a weekly summary report of all closed deals',
    'can you make a workflow to automatically assign new oppurtunities to sales reps based on territory?',
    'create workflow that updates contact status to inactive if theres no activity for 90 days',
    'Build automation to send followup email 3 days after first contact with prospect',
    'i want to automatically create a task for account manager when deal reaches negotiation stage',
    'setup a workflow that enriches company data from clearbit when new account is created',
    'make a workflow to notify slack channel when deal amount is over $50k',
    'need workflow that runs daily and finds all overdue tasks then sends reminder emails',
    'Create automation to update lead score when contact opens email or clicks link',
    'workflow to automatically create renewal opportunity 60 days before contract end date',
    'can you build a flow that copies contact info to company record when deal is won?',
    'I need to send a survey email 7 days after deal closes',
    'make workflow that assigns leads round-robin style to available sales reps',
    'create automation to tag contacts as "hot lead" when they visit pricing page 3 times',
    'workflow that escalates support tickets to manager if not resolved in 48 hours',
    'need a workflow to sync new contacts to mailchimp mailing list',
    'build flow that updates deal stage to lost if no activity for 30 days',
    'create workflow that sends birthday email to contacts on thier birthday',
    'can i get a workflow that creates calendar event when meeting is scheduled with prospect',
    'workflow to automatically generate quote pdf when opportunity moves to proposal stage',
  ],
};
