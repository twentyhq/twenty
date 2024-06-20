'use client';

import { useEffect, useState } from 'react';

import Playground from '@/app/_components/playground/playground';
import { RestApiWrapper } from '@/app/_components/playground/rest-api-wrapper';

const RestApi = () => {
  const [openApiJson, setOpenApiJson] = useState({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const children = <RestApiWrapper openApiJson={openApiJson} />;

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

export default RestApi;
