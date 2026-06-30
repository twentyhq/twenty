import { type PreInstallLogicFunctionApplicationManifest } from './preInstallLogicFunctionApplicationType';

export type PostInstallLogicFunctionApplicationManifest =
  PreInstallLogicFunctionApplicationManifest & {
    shouldRunSynchronously?: boolean;
  };
