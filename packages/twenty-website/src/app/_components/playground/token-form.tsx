'use client';

import React, { useEffect, useState } from 'react';
import { TbApi, TbChevronLeft, TbLink } from 'react-icons/tb';
import { usePathname, useRouter } from 'next/navigation';

// @ts-expect-error Migration loader as text not passing warnings
import tokenForm from '!css-loader!./token-form.css';

export type SubDoc = 'core' | 'metadata';
export type TokenFormProps = {
  setOpenApiJson?: (json: object) => void;
  setToken?: (token: string) => void;
  setBaseUrl?: (baseUrl: string) => void;
  isTokenValid?: boolean;
  setIsTokenValid?: (arg: boolean) => void;
  setLoadingState?: (arg: boolean) => void;
  subDoc?: SubDoc;
};

const TokenForm = ({
  setOpenApiJson,
  setToken,
  setBaseUrl: submitBaseUrl,
  isTokenValid,
  setIsTokenValid,
  subDoc,
  setLoadingState,
}: TokenFormProps) => {
  const router = useRouter();

  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(false);
  const [locationSetting, setLocationSetting] = useState(
    (typeof window !== 'undefined' &&
      window.localStorage.getItem('baseUrl') &&
      JSON.parse(window.localStorage.getItem('baseUrl') ?? '')
        ?.locationSetting) ??
      'production',
  );
  const [baseUrl, setBaseUrl] = useState(
    (typeof window !== 'undefined' &&
      window.localStorage.getItem('baseUrl') &&
      JSON.parse(window.localStorage.getItem('baseUrl') ?? '')?.baseUrl) ??
      'https://api.twenty.com',
  );

  const tokenLocal = (
    typeof window !== 'undefined'
      ? window?.localStorage?.getItem?.('TryIt_securitySchemeValues')
      : '{}'
  ) as string;

  const token = JSON.parse(tokenLocal)?.bearerAuth ?? '';

  const updateLoading = (loading = false) => {
    setIsLoading(loading);
    setLoadingState?.(!!loading);
  };

  const updateToken = async (event: React.ChangeEvent<HTMLInputElement>) => {
    window.localStorage.setItem(
      'TryIt_securitySchemeValues',
      JSON.stringify({ bearerAuth: event.target.value }),
    );
    await submitToken(event.target.value);
  };

  const updateBaseUrl = (baseUrl: string, locationSetting: string) => {
    let url: string;
    if (locationSetting === 'production') {
      url = 'https://api.twenty.com';
    } else if (locationSetting === 'demo') {
      url = 'https://api-demo.twenty.com';
    } else if (locationSetting === 'localhost') {
      url = 'http://localhost:3000';
    } else {
      url = baseUrl;
    }

    setBaseUrl(url);
    setLocationSetting(locationSetting);
    submitBaseUrl?.(url);
    window.localStorage.setItem(
      'baseUrl',
      JSON.stringify({ baseUrl: url, locationSetting }),
    );
  };

  const validateToken = (openApiJson: any) => {
    setIsTokenValid?.(!!openApiJson.tags);
  };

  const getJson = async (token: string) => {
    updateLoading(true);

    return await fetch(baseUrl + '/open-api/' + (subDoc ?? 'core'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((result) => {
        validateToken(result);
        updateLoading(false);

        return result;
      })
      .catch(() => {
        updateLoading(false);
        setIsTokenValid?.(false);
      });
  };

  const submitToken = async (token: any) => {
    if (isLoading) return;

    const json = await getJson(token);

    setToken && setToken(token);

    setOpenApiJson && setOpenApiJson(json);
  };

  useEffect(() => {
    (async () => {
      updateBaseUrl(baseUrl, locationSetting);
      await submitToken(token);
    })();
  }, []);

  // We load playground style using useEffect as it breaks remaining docs style
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = tokenForm.toString();
    document.head.append(styleElement);

    return () => styleElement.remove();
  }, []);

  return (
    <div className="form-container">
      <form className="form">
        <div className="backButton" onClick={() => router.back()}>
          <TbChevronLeft size={18} />
          <span>Back</span>
        </div>
        <div className="inputWrapper">
          <select
            className="select"
            onChange={(event) => {
              updateBaseUrl(baseUrl, event.target.value);
            }}
            value={locationSetting}
          >
            <option value="production">Production API</option>
            <option value="demo">Demo API</option>
            <option value="localhost">Localhost</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="inputWrapper">
          <div className="inputIcon" title="Base URL">
            <TbLink size={20} />
          </div>
          <input
            className={'input'}
            type="text"
            readOnly={isLoading}
            disabled={locationSetting !== 'other'}
            placeholder="Base URL"
            value={baseUrl}
            onChange={(event) =>
              updateBaseUrl(event.target.value, locationSetting)
            }
            onBlur={() => submitToken(token)}
          />
        </div>
        <div className="inputWrapper">
          <div className="inputIcon" title="Api Key">
            <TbApi size={20} />
          </div>
          <input
            className={!isTokenValid && !isLoading ? 'input invalid' : 'input'}
            type="text"
            readOnly={isLoading}
            placeholder="API Key"
            defaultValue={token}
            onChange={updateToken}
          />
        </div>
        <div className="inputWrapper" style={{ maxWidth: '100px' }}>
          <select
            className="select"
            onChange={(event) =>
              router.replace(
                pathname.split('/').slice(0, -1).join('/') +
                  '/' +
                  event.target.value,
              )
            }
            value={pathname.split('/').at(-1)}
          >
            <option value="core">Core</option>
            <option value="metadata">Metadata</option>
          </select>
        </div>
      </form>
    </div>
  );
};

export default TokenForm;
