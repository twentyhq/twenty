'use client';
import React, { useEffect, useState } from 'react';

import Playground from '@/app/_components/playground/playground';
import { RestApiWrapper } from '@/app/_components/playground/rest-api-wrapper';

const restApi = () => {
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
    <Playground
      children={children}
      setOpenApiJson={setOpenApiJson}
      subDoc="metadata"
    />
  );
};

export default restApi;
