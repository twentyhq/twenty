import { type Dispatch, type SetStateAction, useEffect } from 'react';

type CodeEditorLoaderConfigurationEffectProps = {
  configureMonacoLoader: () => Promise<void>;
  setIsMonacoLoaderConfigured: Dispatch<SetStateAction<boolean>>;
};

export const CodeEditorLoaderConfigurationEffect = ({
  configureMonacoLoader,
  setIsMonacoLoaderConfigured,
}: CodeEditorLoaderConfigurationEffectProps) => {
  useEffect(() => {
    let isStillMounted = true;

    configureMonacoLoader().then(() => {
      if (isStillMounted) {
        setIsMonacoLoaderConfigured(true);
      }
    });

    return () => {
      isStillMounted = false;
    };
  }, [configureMonacoLoader, setIsMonacoLoaderConfigured]);

  return null;
};
