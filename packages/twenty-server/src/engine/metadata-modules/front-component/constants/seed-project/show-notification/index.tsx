import {
  defineFrontComponent,
  enqueueSnackbar,
  unmountFrontComponent,
} from 'twenty-sdk';
import { useEffect } from 'react';

const ShowNotification = () => {
  useEffect(() => {
    const run = async () => {
      await enqueueSnackbar({
        message: 'Hello from a headless front component!',
        variant: 'success',
        duration: 5000,
      });

      await unmountFrontComponent();
    };

    run();
  }, []);

  return null;
};

export default defineFrontComponent({
  universalIdentifier: 'seed-front-component-show-notification',
  name: 'Show Notification',
  description: 'A sample headless front component that displays a notification',
  isHeadless: true,
  component: ShowNotification,
});
