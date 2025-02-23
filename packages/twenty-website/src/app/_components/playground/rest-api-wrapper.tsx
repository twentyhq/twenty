import React, { useEffect } from 'react';
// @ts-expect-error Migration loader as text not passing warnings
import { API } from '@stoplight/elements';

// @ts-expect-error Migration loader as text not passing warnings
import spotlightTheme from '!css-loader!@stoplight/elements/styles.min.css';

export const RestApiWrapper = ({ openApiJson }: { openApiJson: any }) => {
  // We load spotlightTheme style using useEffect as it breaks remaining docs style
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = spotlightTheme.toString();
    document.head.append(styleElement);

    return () => styleElement.remove();
  }, []);

  return (
    <div
      style={{
        height: 'calc(100vh - var(--ifm-navbar-height) - 45px)',
        width: '100%',
        overflow: 'auto',
      }}
    >
      <API
        apiDescriptionDocument={JSON.stringify(openApiJson)}
        hideSchemas={true}
        router="hash"
      />
    </div>
  );
};
