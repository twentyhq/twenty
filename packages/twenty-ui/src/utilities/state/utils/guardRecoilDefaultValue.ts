import { DefaultValue } from 'recoil';

export const guardRecoilDefaultValue = (
  candidate: any,
): candidate is DefaultValue => candidate instanceof DefaultValue;
