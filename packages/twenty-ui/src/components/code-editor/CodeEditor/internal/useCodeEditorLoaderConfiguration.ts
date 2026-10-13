import { useEffect, useState } from 'react';

export const useCodeEditorLoaderConfiguration = (
  configureMonacoLoader: () => Promise<void>,
) => {
  const [isMonacoLoaderConfigured, setIsMonacoLoaderConfigured] =
    useState(false);

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
  }, [configureMonacoLoader]);

  return isMonacoLoaderConfigured;
};
