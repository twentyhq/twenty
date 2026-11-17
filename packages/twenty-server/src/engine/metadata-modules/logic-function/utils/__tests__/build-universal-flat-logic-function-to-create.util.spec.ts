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
  it('keeps the job group keys it is given', () => {
    expect(
      buildUniversalFlatLogicFunctionToCreate({
        ...REQUIRED_INPUT,
        jobGroupKeys: ['imports'],
      }).jobGroupKeys,
    ).toEqual(['imports']);
  });

  it('puts the logic function in no job group by default', () => {
    expect(
      buildUniversalFlatLogicFunctionToCreate(REQUIRED_INPUT).jobGroupKeys,
    ).toEqual([]);
  });
});
