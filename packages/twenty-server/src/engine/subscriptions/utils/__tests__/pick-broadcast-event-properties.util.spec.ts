import { pickBroadcastEventProperties } from 'src/engine/subscriptions/utils/pick-broadcast-event-properties.util';

describe('pickBroadcastEventProperties', () => {
  it('leaves an ungated entity untouched', () => {
    const properties = {
      after: { id: 'view-1', name: 'My view' },
    };

    expect(
      pickBroadcastEventProperties({ entityName: 'view', properties }),
    ).toEqual(properties);
  });

  it('keeps only the routing identifiers of a workflow', () => {
    expect(
      pickBroadcastEventProperties({
        entityName: 'workflow',
        properties: {
          updatedFields: ['name'],
          after: {
            id: 'workflow-1',
            name: 'Secret workflow',
            visibility: 'PRIVATE',
          },
        },
      }),
    ).toEqual({
      updatedFields: ['name'],
      before: undefined,
      after: { id: 'workflow-1' },
    });
  });

  it('strips the steps of a deleted workflow version', () => {
    expect(
      pickBroadcastEventProperties({
        entityName: 'workflowVersion',
        properties: {
          before: {
            id: 'workflow-version-1',
            coreWorkflowId: 'workflow-1',
            steps: [{ type: 'CODE' }],
            triggers: [{ type: 'MANUAL' }],
          },
        },
      }),
    ).toEqual({
      updatedFields: undefined,
      before: { id: 'workflow-version-1', coreWorkflowId: 'workflow-1' },
      after: undefined,
    });
  });
});
