'use client';
import React, { useEffect, useState } from 'react';
// @ts-expect-error Migration loader as text not passing warnings
import { API } from '@stoplight/elements';

import Playground from '@/app/_components/playground/playground';

// @ts-expect-error Migration loader as text not passing warnings
import spotlightTheme from '!css-loader!@stoplight/elements/styles.min.css';

const RestApiComponent = ({ openApiJson }: { openApiJson: any }) => {
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
      <API apiDescriptionDocument={JSON.stringify(openApiJson)} router="hash" />
    </div>
  );
};

const restApi = () => {
  const [openApiJson, setOpenApiJson] = useState({});

  const children = <RestApiComponent openApiJson={openApiJson} />;

  return (
    <div style={{ width: '100vw' }}>
      <Playground
        children={children}
        setOpenApiJson={setOpenApiJson}
        subDoc="core"
      />
    </div>
  );
};

export default restApi;
