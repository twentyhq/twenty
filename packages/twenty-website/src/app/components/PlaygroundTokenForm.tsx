import React, { useEffect, useState } from 'react';
import { TbLoader2 } from 'react-icons/tb';
import styled from '@emotion/styled';
import { parseJson } from 'nx/src/utils/json';

export type TokenFormProps = {
  setOpenApiJson?: (json: object) => void;
  setToken?: (token: string) => void;
  isTokenValid: boolean;
  setIsTokenValid: (boolean: boolean) => void;
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 90vh;
`;

const Form = styled.form`
  text-align: center;
  padding: 50px;
`;

const StyledLink = styled.a`
  color: #16233f;
  text-decoration: none;
  position: relative;
  font-weight: bold;
  transition: color 0.3s ease;

  [data-theme='dark'] & {
    color: #a3c0f8;
  }
`;

const Input = styled.input`
  padding: 6px;
  margin: 20px 0 5px 0;
  max-width: 460px;
  width: 100%;
  box-sizing: border-box;
  background-color: #f3f3f3;
  border: 1px solid #ddd;
  border-radius: 4px;

  [data-theme='dark'] & {
    background-color: #16233f;
  }

  &.invalid {
    border: 1px solid #f83e3e;
  }
`;

const TokenInvalid = styled.span`
  color: #f83e3e;
  font-size: 12px;
`;

const Loader = styled(TbLoader2)`
  color: #16233f;
  font-size: 2rem;
  animation: animate 2s infinite;

  [data-theme='dark'] & {
    color: #a3c0f8;
  }

  &.not-visible {
    visibility: hidden;
  }

  @keyframes animate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(720deg);
    }
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
`;

const TokenForm = ({
  setOpenApiJson,
  setToken,
  isTokenValid,
  setIsTokenValid,
}: TokenFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const token =
    parseJson(localStorage.getItem('TryIt_securitySchemeValues') || '')
      ?.bearerAuth ?? '';

  const updateToken = async (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem(
      'TryIt_securitySchemeValues',
      JSON.stringify({ bearerAuth: event.target.value }),
    );
    await submitToken(event.target.value);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateToken = (openApiJson: any) =>
    setIsTokenValid(!!openApiJson.tags);

  const getJson = async (token: string) => {
    setIsLoading(true);

    return await fetch('https://api.twenty.com/open-api', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((result) => {
        validateToken(result);
        setIsLoading(false);

        return result;
      })
      .catch(() => setIsLoading(false));
  };

  const submitToken = async (token: string) => {
    if (isLoading) return;

    const json = await getJson(token);

    setToken && setToken(token);

    setOpenApiJson && setOpenApiJson(json);
  };

  useEffect(() => {
    (async () => {
      await submitToken(token);
    })();
  });

  // We load playground style using useEffect as it breaks remaining docs style
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = TokenForm.toString();
    document.head.append(styleElement);

    return () => styleElement.remove();
  }, []);

  return (
    !isTokenValid && (
      <Container>
        <Form>
          <label>
            To load your playground schema,{' '}
            <StyledLink href="https://app.twenty.com/settings/developers">
              generate an API key
            </StyledLink>{' '}
            and paste it here:
          </label>
          <p>
            <Input
              className={token && !isLoading ? 'input invalid' : 'input'}
              type="text"
              readOnly={isLoading}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMD..."
              defaultValue={token}
              onChange={updateToken}
            />
            <TokenInvalid
              className={`${(!token || isLoading) && 'not-visible'}`}
            >
              Token invalid
            </TokenInvalid>
            <LoaderContainer>
              <Loader className={`${!isLoading && 'not-visible'}`} />
            </LoaderContainer>
          </p>
        </Form>
      </Container>
    )
  );
};

export default TokenForm;
