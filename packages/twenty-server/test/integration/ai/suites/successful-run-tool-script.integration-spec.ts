import { randomUUID } from 'node:crypto';

import { executeToolThroughMcp } from 'test/integration/ai/suites/utils/execute-tool-through-mcp.util';
import { runToolScriptThroughMcp } from 'test/integration/ai/suites/utils/run-tool-script-through-mcp.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type RecordWithId = { id: string };

type FindManyResult<TRecord> = { records: TRecord[] };

const OPPORTUNITY_NAME_PREFIX = `Code mode ${randomUUID().slice(0, 8)}`;

const buildMidMonthCloseDate = () => {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 15, 12),
  ).toISOString();
};

// Written the way a model would after learn_tools, scoped to this run's opportunities by name
const FOLLOW_UP_SCRIPT = `
import datetime

today = datetime.date.today()
month_start = today.replace(day=1)
next_month_start = (month_start + datetime.timedelta(days=32)).replace(day=1)

opportunities = await call_tool("find_many_opportunities", {
    "select": ["id", "name", "ownerId"],
    "and": [
        {"closeDate": {"gte": month_start.isoformat() + "T00:00:00Z"}},
        {"closeDate": {"lt": next_month_start.isoformat() + "T00:00:00Z"}},
    ],
    "name": {"startsWith": "${OPPORTUNITY_NAME_PREFIX}"},
    "limit": 100,
})
opportunity_by_id = {record["id"]: record for record in opportunities["records"]}

targets = await call_tool("find_many_task_targets", {
    "select": ["targetOpportunityId"],
    "targetOpportunityId": {"in": list(opportunity_by_id.keys())},
    "limit": 100,
})
covered_ids = {target["targetOpportunityId"] for target in targets["records"]}
uncovered = [record for record in opportunity_by_id.values() if record["id"] not in covered_ids]

created_task_ids = []
if uncovered:
    tasks = await call_tool("create_many_tasks", {
        "records": [
            {
                "title": f"Follow up on {record['name']}",
                "status": "TODO",
                **({"assigneeId": record["ownerId"]} if record.get("ownerId") else {}),
            }
            for record in uncovered
        ]
    })
    created_task_ids = [task["id"] for task in tasks]
    await call_tool("create_many_task_targets", {
        "records": [
            {"taskId": task_id, "targetOpportunityId": record["id"]}
            for task_id, record in zip(created_task_ids, uncovered)
        ]
    })

{"createdTaskIds": created_task_ids, "opportunityIds": [record["id"] for record in uncovered]}
`;

describe('run_tool_script over MCP', () => {
  const opportunityIds: Record<'withTask' | 'unowned' | 'owned', string> = {
    withTask: '',
    unowned: '',
    owned: '',
  };
  const taskIdsToCleanUp: string[] = [];
  const taskTargetIdsToCleanUp: string[] = [];

  beforeAll(async () => {
    const closeDate = buildMidMonthCloseDate();

    const createdOpportunities = await executeToolThroughMcp<RecordWithId[]>({
      toolName: 'create_many_opportunities',
      toolArguments: {
        records: [
          {
            name: `${OPPORTUNITY_NAME_PREFIX} with task`,
            closeDate,
            ownerId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
          },
          { name: `${OPPORTUNITY_NAME_PREFIX} unowned`, closeDate },
          {
            name: `${OPPORTUNITY_NAME_PREFIX} owned`,
            closeDate,
            ownerId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          },
        ],
      },
      expectToFail: false,
    });

    const [withTask, unowned, owned] = createdOpportunities.result ?? [];

    opportunityIds.withTask = withTask.id;
    opportunityIds.unowned = unowned.id;
    opportunityIds.owned = owned.id;

    const existingTasks = await executeToolThroughMcp<RecordWithId[]>({
      toolName: 'create_many_tasks',
      toolArguments: { records: [{ title: 'Existing task' }] },
      expectToFail: false,
    });
    const existingTaskId = existingTasks.result?.[0].id as string;

    taskIdsToCleanUp.push(existingTaskId);

    const existingTaskTargets = await executeToolThroughMcp<RecordWithId[]>({
      toolName: 'create_many_task_targets',
      toolArguments: {
        records: [
          {
            taskId: existingTaskId,
            targetOpportunityId: opportunityIds.withTask,
          },
        ],
      },
      expectToFail: false,
    });

    taskTargetIdsToCleanUp.push(existingTaskTargets.result?.[0].id as string);
  });

  afterAll(async () => {
    await deleteRecordsByIds('taskTarget', taskTargetIdsToCleanUp);
    await deleteRecordsByIds('task', taskIdsToCleanUp);
    await deleteRecordsByIds('opportunity', Object.values(opportunityIds));
  });

  it('creates a follow-up task for each opportunity closing this month without one', async () => {
    const output = await runToolScriptThroughMcp({
      code: FOLLOW_UP_SCRIPT,
      expectToFail: false,
    });

    const { createdTaskIds, opportunityIds: followedUpOpportunityIds } =
      output.result as { createdTaskIds: string[]; opportunityIds: string[] };

    taskIdsToCleanUp.push(...createdTaskIds);

    expect(output.toolCalls).toEqual([
      { name: 'find_many_opportunities', success: true },
      { name: 'find_many_task_targets', success: true },
      { name: 'create_many_tasks', success: true },
      { name: 'create_many_task_targets', success: true },
    ]);
    expect(createdTaskIds).toHaveLength(2);
    expect([...followedUpOpportunityIds].sort()).toEqual(
      [opportunityIds.unowned, opportunityIds.owned].sort(),
    );

    const createdTasks = await executeToolThroughMcp<
      FindManyResult<{ id: string; title: string; assigneeId: string | null }>
    >({
      toolName: 'find_many_tasks',
      toolArguments: {
        select: ['id', 'title', 'assigneeId'],
        title: { startsWith: `Follow up on ${OPPORTUNITY_NAME_PREFIX}` },
        limit: 10,
      },
      expectToFail: false,
    });

    const createdTaskTargets = await executeToolThroughMcp<
      FindManyResult<{
        id: string;
        taskId: string;
        targetOpportunityId: string;
      }>
    >({
      toolName: 'find_many_task_targets',
      toolArguments: {
        select: ['id', 'taskId', 'targetOpportunityId'],
        taskId: { in: createdTaskIds },
        limit: 10,
      },
      expectToFail: false,
    });

    taskTargetIdsToCleanUp.push(
      ...(createdTaskTargets.result?.records ?? []).map(({ id }) => id),
    );

    const taskById = new Map(
      (createdTasks.result?.records ?? []).map((task) => [task.id, task]),
    );
    const linkedTasks = (createdTaskTargets.result?.records ?? []).map(
      (taskTarget) => ({
        targetOpportunityId: taskTarget.targetOpportunityId,
        title: taskById.get(taskTarget.taskId)?.title,
        assigneeId: taskById.get(taskTarget.taskId)?.assigneeId,
      }),
    );

    expect(taskById.size).toBe(2);
    expect(linkedTasks).toHaveLength(2);
    expect(linkedTasks).toEqual(
      expect.arrayContaining([
        {
          targetOpportunityId: opportunityIds.unowned,
          title: `Follow up on ${OPPORTUNITY_NAME_PREFIX} unowned`,
          assigneeId: null,
        },
        {
          targetOpportunityId: opportunityIds.owned,
          title: `Follow up on ${OPPORTUNITY_NAME_PREFIX} owned`,
          assigneeId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        },
      ]),
    );
  });

  it('hands scripts empty lists and null fields as they are', async () => {
    const output = await runToolScriptThroughMcp({
      code: `
nothing = await call_tool("find_many_opportunities", {
    "select": ["id"],
    "name": {"eq": "${OPPORTUNITY_NAME_PREFIX} does not exist"},
})
unowned = await call_tool("find_many_opportunities", {
    "select": ["id", "ownerId"],
    "name": {"eq": "${OPPORTUNITY_NAME_PREFIX} unowned"},
})
{"nothing": nothing["records"], "ownerId": unowned["records"][0]["ownerId"]}
`,
      expectToFail: false,
    });

    expect(output.result).toEqual({ nothing: [], ownerId: null });
  });
});
