import { type WorkflowStepPositionInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position.input';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_STEP_DEFINITION } from 'src/modules/workflow/workflow-builder/workflow-version-step/constants/workflow-step.constants';
import {
  WorkflowActionType,
  type WorkflowAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const buildStaticWorkflowStep = ({
  baseStep,
  type,
  activeObjectMetadataItem,
}: {
  baseStep: {
    id: string;
    position?: WorkflowStepPositionInput;
    valid: boolean;
    nextStepIds: string[];
  };
  type: WorkflowActionType;
  activeObjectMetadataItem?: ObjectMetadataEntity | null;
}): { builtStep: WorkflowAction } | undefined => {
  switch (type) {
    case WorkflowActionType.SEND_EMAIL: {
      return {
        builtStep: {
          ...baseStep,
          name: 'Send Email',
          type: WorkflowActionType.SEND_EMAIL,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              connectedAccountId: '',
              recipients: {
                to: '',
                cc: '',
                bcc: '',
              },
              subject: '',
              body: '',
            },
          },
        },
      };
    }
    case WorkflowActionType.DRAFT_EMAIL: {
      return {
        builtStep: {
          ...baseStep,
          name: 'Draft Email',
          type: WorkflowActionType.DRAFT_EMAIL,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              connectedAccountId: '',
              recipients: {
                to: '',
                cc: '',
                bcc: '',
              },
              subject: '',
              body: '',
            },
          },
        },
      };
    }
    case WorkflowActionType.CREATE_RECORD: {
      return {
        builtStep: {
          ...baseStep,
          name: 'Create Record',
          type: WorkflowActionType.CREATE_RECORD,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              objectName: activeObjectMetadataItem?.nameSingular || '',
              objectRecord: {},
            },
          },
        },
      };
    }
    case WorkflowActionType.UPDATE_RECORD: {
      return {
        builtStep: {
          ...baseStep,
          name: 'Update Record',
          type: WorkflowActionType.UPDATE_RECORD,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              objectName: activeObjectMetadataItem?.nameSingular || '',
              objectRecord: {},
              objectRecordId: '',
              fieldsToUpdate: [],
            },
          },
        },
      };
    }
    case WorkflowActionType.DELETE_RECORD: {
      return {
        builtStep: {
          ...baseStep,
          name: 'Delete Record',
          type: WorkflowActionType.DELETE_RECORD,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              objectName: activeObjectMetadataItem?.nameSingular || '',
              objectRecordId: '',
            },
          },
        },
      };
    }
    case WorkflowActionType.UPSERT_RECORD: {
      return {
        builtStep: {
          ...baseStep,
          name: 'Create or Update Record',
          type: WorkflowActionType.UPSERT_RECORD,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              objectName: activeObjectMetadataItem?.nameSingular || '',
              objectRecord: {},
              fieldsToUpdate: [],
            },
          },
        },
      };
    }
    case WorkflowActionType.FIND_RECORDS: {
      return {
        builtStep: {
          ...baseStep,
          name: 'Search Records',
          type: WorkflowActionType.FIND_RECORDS,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              objectName: activeObjectMetadataItem?.nameSingular || '',
              limit: 1,
            },
          },
        },
      };
    }
    case WorkflowActionType.FORM: {
      return {
        builtStep: {
          ...baseStep,
          name: 'Form',
          type: WorkflowActionType.FORM,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: [],
          },
        },
      };
    }
    case WorkflowActionType.FILTER: {
      return {
        builtStep: {
          ...baseStep,
          name: 'Filter',
          type: WorkflowActionType.FILTER,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              stepFilterGroups: [],
              stepFilters: [],
            },
          },
        },
      };
    }
    case WorkflowActionType.HTTP_REQUEST: {
      return {
        builtStep: {
          ...baseStep,
          name: 'HTTP Request',
          type: WorkflowActionType.HTTP_REQUEST,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              url: '',
              method: 'GET',
              headers: {},
              body: {},
            },
          },
        },
      };
    }
    case WorkflowActionType.DELAY: {
      return {
        builtStep: {
          ...baseStep,
          name: 'Delay',
          type: WorkflowActionType.DELAY,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {
              delayType: 'DURATION',
              duration: {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
              },
            },
          },
        },
      };
    }
    case WorkflowActionType.EMPTY: {
      return {
        builtStep: {
          ...baseStep,
          name: 'Add an Action',
          type: WorkflowActionType.EMPTY,
          valid: true,
          settings: {
            ...BASE_STEP_DEFINITION,
            input: {},
          },
        },
      };
    }
    default:
      return undefined;
  }
};
