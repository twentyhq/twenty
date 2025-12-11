import { AllStandardAgentName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-agent-name.type';

export const STANDARD_ROLE_TARGET = {
  agent: {
    dashboardBuilder: {
      universalIdentifier: 'ece4d7e4-ef38-47e9-878c-ee912e2ba959',
    },
    dataManipulator: {
      universalIdentifier: '8f364c14-77a1-4605-bd65-60d291658b93',
    },
    helper: {
      universalIdentifier: 'fb78a8be-382b-4ff0-80b2-bb25c81176db',
    },
    metadataBuilder: {
      universalIdentifier: '67b21c9b-2e2d-44f4-81de-68ef5462034e',
    },
    researcher: {
      universalIdentifier: '5e8d101a-d339-42e7-83ef-945c9247c677',
    },
    workflowBuilder: {
      universalIdentifier: '0641ec8b-e071-45e6-a036-d4ba4b0488b4',
    },
  },
} as const satisfies {
  agent: Record<AllStandardAgentName, { universalIdentifier: string }>;
};
