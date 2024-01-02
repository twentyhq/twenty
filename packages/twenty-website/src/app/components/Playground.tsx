import TokenForm, {
  TokenFormProps,
} from '@/app/components/PlaygroundTokenForm';
import React, { ReactNode, useState } from 'react';

type PlaygroundProps = TokenFormProps & {
  children?: ReactNode;
};

const Playground = ({
  children,
  setOpenApiJson,
  setToken,
}: PlaygroundProps) => {
  const [isTokenValid, setIsTokenValid] = useState(false);

  return (
    <>
      <TokenForm
        setOpenApiJson={setOpenApiJson}
        setToken={setToken}
        isTokenValid={isTokenValid}
        setIsTokenValid={setIsTokenValid}
      />
      {isTokenValid && children}
    </>
  );
};

export default Playground;
