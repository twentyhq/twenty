import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkflowRunService {
  async run(_: object) {
    const trigger = {
      name: 'step_1',
      type: 'CODE',
      valid: true,
      settings: {
        input: {},
        sourceCode: {
          code: 'export const code = async (inputs) => {\n  return true;\n};',
          packageJson:
            '\n      {\n        "dependencies": {\n        }\n      }',
        },
        errorHandlingOptions: {
          retryOnFailure: {
            value: false,
          },
          continueOnFailure: {
            value: false,
          },
        },
      },
      displayName: 'Code',
    };
  }
}
