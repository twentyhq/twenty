import { WorkflowActionType } from 'twenty-shared/workflow';

import { validateWorkflowClassifyStep } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-classify-step.util';
import { type WorkflowClassifyAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const buildStep = (
  input: Partial<WorkflowClassifyAction['settings']['input']>,
): WorkflowClassifyAction =>
  ({
    id: 'step-1',
    name: 'Classify',
    type: WorkflowActionType.CLASSIFY,
    valid: true,
    settings: {
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: 0 },
        continueOnFailure: { value: false },
      },
      input: {
        state: 'Some state',
        questions: [
          {
            id: 'q1',
            name: 'intent',
            type: 'choice',
            instructions: 'What does it ask for?',
            criteria: [
              { id: 'c1', name: 'pricing' },
              { id: 'c2', name: 'support' },
            ],
          },
        ],
        ...input,
      },
    },
  }) as WorkflowClassifyAction;

const codesFor = (
  input: Partial<WorkflowClassifyAction['settings']['input']>,
): string[] =>
  validateWorkflowClassifyStep(buildStep(input)).map((issue) => issue.code);

describe('validateWorkflowClassifyStep', () => {
  it.each([
    ['{{trigger.company.name}}', []],
    ['Company {{trigger.company.name}}', []],
    ['Company.inc {{trigger.company.name}}', ['CLASSIFY_INCOMPLETE_QUESTION']],
  ])('validates the literal part of option %s', (name, expectedCodes) => {
    const step = buildStep({});
    step.settings.input.questions[0].criteria[0].name = name;
    expect(
      validateWorkflowClassifyStep(step).map((issue) => issue.code),
    ).toEqual(expectedCodes);
  });

  it('should pass a fully configured step', () => {
    expect(codesFor({})).toEqual([]);
  });

  it('should refuse activation with nothing to classify', () => {
    expect(codesFor({ state: '' })).toEqual(['CLASSIFY_MISSING_STATE']);
  });

  it('should refuse activation with no questions', () => {
    expect(codesFor({ questions: [] })).toEqual([
      'CLASSIFY_INCOMPLETE_QUESTION',
    ]);
  });

  // The default step ships exactly like this, so it must not be activable.
  it('should refuse a freshly added, untouched question', () => {
    expect(
      codesFor({
        state: '',
        questions: [
          {
            id: 'q1',
            name: 'category',
            type: 'choice',
            instructions: '',
            criteria: [],
          },
        ],
      }),
    ).toEqual(['CLASSIFY_MISSING_STATE', 'CLASSIFY_INCOMPLETE_QUESTION']);
  });

  it('should refuse a choice question with no options', () => {
    expect(
      codesFor({
        questions: [
          {
            id: 'q1',
            name: 'intent',
            type: 'choice',
            instructions: 'Which?',
            criteria: [],
          },
        ],
      }),
    ).toEqual(['CLASSIFY_INCOMPLETE_QUESTION']);
  });

  it('should refuse a score question with a single level', () => {
    expect(
      codesFor({
        questions: [
          {
            id: 'q1',
            name: 'urgency',
            type: 'score',
            instructions: 'How urgent?',
            criteria: [{ id: 'c1', name: 'Low' }],
          },
        ],
      }),
    ).toEqual(['CLASSIFY_INCOMPLETE_QUESTION']);
  });

  it('should accept a boolean question with no criteria', () => {
    expect(
      codesFor({
        questions: [
          {
            id: 'q1',
            name: 'isSpam',
            type: 'boolean',
            instructions: 'Is this spam?',
            criteria: [],
          },
        ],
      }),
    ).toEqual([]);
  });

  // A dot would be read as structure by the variable resolver, so the answer
  // this step advertises could never be referenced.
  it('should refuse an answer name that is not a valid variable key', () => {
    expect(
      codesFor({
        questions: [
          {
            id: 'q1',
            name: 'customer.intent',
            type: 'boolean',
            instructions: 'Is this a customer?',
            criteria: [],
          },
        ],
      }),
    ).toEqual(['CLASSIFY_INCOMPLETE_QUESTION']);
  });

  it('should refuse a choice question listing the same option twice', () => {
    expect(
      codesFor({
        questions: [
          {
            id: 'q1',
            name: 'intent',
            type: 'choice',
            instructions: 'Which?',
            criteria: [
              { id: 'c1', name: 'pricing' },
              { id: 'c2', name: 'pricing' },
            ],
          },
        ],
      }),
    ).toEqual(['CLASSIFY_INCOMPLETE_QUESTION']);
  });

  it('should refuse two questions sharing an answer name', () => {
    expect(
      codesFor({
        questions: [
          {
            id: 'q1',
            name: 'intent',
            type: 'boolean',
            instructions: 'Is this spam?',
            criteria: [],
          },
          {
            id: 'q2',
            name: 'intent',
            type: 'boolean',
            instructions: 'Is this urgent?',
            criteria: [],
          },
        ],
      }),
    ).toEqual(['CLASSIFY_INCOMPLETE_QUESTION']);
  });

  // A step should report every reason it cannot activate at once; otherwise an
  // author fixes one problem only to be told about the next.
  // An option keys its probability, so a dot in it advertises
  // {{step.answers.intent.probabilities.v1.2}}, which the resolver walks as two
  // keys. A space survives, because escapePathSegment brackets it.
  it('should refuse a choice option whose name cannot be read back', () => {
    expect(
      codesFor({
        questions: [
          {
            id: 'q1',
            name: 'intent',
            type: 'choice',
            instructions: 'Which release?',
            criteria: [
              { id: 'c1', name: 'v1.2' },
              { id: 'c2', name: 'main' },
            ],
          },
        ],
      }),
    ).toEqual(['CLASSIFY_INCOMPLETE_QUESTION']);
  });

  it('should accept a choice option name with spaces', () => {
    expect(
      codesFor({
        questions: [
          {
            id: 'q1',
            name: 'intent',
            type: 'choice',
            instructions: 'Which team?',
            criteria: [
              { id: 'c1', name: 'High priority' },
              { id: 'c2', name: 'Can wait' },
            ],
          },
        ],
      }),
    ).toEqual([]);
  });

  // Score probabilities are keyed by level index, so a label never becomes a
  // path segment and stays free text.
  it('should accept a score level label containing a dot', () => {
    expect(
      codesFor({
        questions: [
          {
            id: 'q1',
            name: 'urgency',
            type: 'score',
            instructions: 'How urgent?',
            criteria: [
              { id: 'c1', name: 'v1.2 and earlier' },
              { id: 'c2', name: 'later' },
            ],
          },
        ],
      }),
    ).toEqual([]);
  });

  it('should report a duplicate name even when the first question is also incomplete', () => {
    const issues = validateWorkflowClassifyStep(
      buildStep({
        questions: [
          {
            id: 'q1',
            name: 'category',
            type: 'choice',
            instructions: '',
            criteria: [{ id: 'c1', name: 'billing' }],
          },
          {
            id: 'q2',
            name: 'category',
            type: 'choice',
            instructions: 'Which team?',
            criteria: [{ id: 'c2', name: 'support' }],
          },
        ],
      }),
    );

    expect(issues).toHaveLength(2);
    expect(issues.map(({ message }) => message)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('no instructions'),
        expect.stringContaining('two questions named "category"'),
      ]),
    );
  });
});
