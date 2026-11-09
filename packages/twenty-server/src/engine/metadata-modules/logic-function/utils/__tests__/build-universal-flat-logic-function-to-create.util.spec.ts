import { buildUniversalFlatLogicFunctionToCreate } from 'src/engine/metadata-modules/logic-function/utils/build-universal-flat-logic-function-to-create.util';

const REQUIRED_INPUT = {
  name: 'my-function',
  handlerName: 'main',
  sourceHandlerPath: 'src/index.ts',
  builtHandlerPath: 'index.mjs',
  isBuildUpToDate: true,
  applicationUniversalIdentifier: 'application-universal-identifier',
};

describe('buildUniversalFlatLogicFunctionToCreate', () => {
  it('keeps the maxRate it is given', () => {
    expect(
      buildUniversalFlatLogicFunctionToCreate({
        ...REQUIRED_INPUT,
        maxRate: { max: 10, durationMs: 1_000 },
      }).maxRate,
    ).toEqual({ max: 10, durationMs: 1_000 });
  });

  it('leaves the maxRate empty by default', () => {
    expect(
      buildUniversalFlatLogicFunctionToCreate(REQUIRED_INPUT).maxRate,
    ).toBeNull();
  });
});
