'use client';

import { msg } from '@lingui/core/macro';
import {
  BaseButton,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import { Body, Heading } from '@/design-system/components';
import { useRenderMessage } from '@/lib/i18n/use-render-message';
import { useTimeoutRegistry } from '@/lib/react';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type ActivationResult = {
  enterpriseKey: string;
  licensee: string;
  subscriptionId: string;
};

const ContentStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(6)};
`;

const ErrorBox = styled.div`
  background-color: ${theme.colors.primary.border[5]};
  border: 1px solid ${theme.colors.accent.pink[70]};
  border-radius: ${theme.radius(2)};
  color: ${theme.colors.accent.pink[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  line-height: 1.55;
  padding: ${theme.spacing(4)};
`;

const successLeadClassName = css`
  color: ${theme.colors.accent.green[100]};
`;

const LicenseeRow = styled.div`
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(1)};
`;

const LicenseeValue = styled.span`
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  line-height: 1.55;
`;

const KeySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
`;

const KeyBlock = styled.div`
  background-color: ${theme.colors.primary.border[5]};
  border: 1px solid ${theme.colors.primary.border[20]};
  border-radius: ${theme.radius(2)};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(2)};
  line-height: 1.5;
  padding: ${theme.spacing(4)};
  padding-right: ${theme.spacing(16)};
  position: relative;
  word-break: break-all;
`;

const CopyTrigger = styled.button<{ $copied: boolean }>`
  ${buttonBaseStyles}
  position: absolute;
  right: ${theme.spacing(2)};
  top: ${theme.spacing(2)};

  /*
   * When showing the "Copied!" success state we override the inner
   * BaseButton's appearance through its documented data-slot hooks.
   * CSS rules cleanly win over SVG presentation attributes (fill on
   * a path element) and over the Label's CSS-driven color, so no
   * !important is needed for those.
   *
   * For the hover-fill we cannot override its inline opacity from CSS
   * (inline style always wins) so we suppress it via visibility: hidden
   * instead — that property is not set inline anywhere, so the cascade
   * resolves correctly without !important.
   */
  ${({ $copied }) =>
    $copied
      ? `
    & [data-slot='button-base-shape'] path,
    & [data-slot='button-base-shape'] rect {
      fill: ${theme.colors.accent.green[100]};
    }

    & [data-slot='button-hover-fill'] {
      visibility: hidden;
      pointer-events: none;
    }

    & [data-slot='button-label'],
    &:is(:hover, :focus-visible) [data-slot='button-label'] {
      color: ${theme.colors.primary.background[100]};
    }
  `
      : ''}
`;

const NextStepsBox = styled.div`
  background-color: ${theme.colors.primary.border[5]};
  border: 1px solid ${theme.colors.primary.border[20]};
  border-left: 3px solid ${theme.colors.highlight[100]};
  border-radius: ${theme.radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  padding: ${theme.spacing(4)};
`;

const NextStepsList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  list-style-position: outside;
  margin: 0;
  padding-left: ${theme.spacing(5)};
`;

const nextStepItemClassName = css`
  &::marker {
    color: ${theme.colors.primary.text[60]};
    font-weight: ${theme.font.weight.medium};
  }
`;

export function EnterpriseActivateClient() {
  const renderText = useRenderMessage();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const timeoutRegistry = useTimeoutRegistry();
  const [result, setResult] = useState<ActivationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided. Please complete the checkout first.');
      setLoading(false);

      return;
    }

    const abortController = new AbortController();

    const activate = async () => {
      try {
        const response = await fetch(
          `/api/enterprise/activate?session_id=${encodeURIComponent(sessionId)}`,
          { signal: abortController.signal },
        );
        const data: { error?: string } & Partial<ActivationResult> =
          await response.json();

        if (abortController.signal.aborted) {
          return;
        }

        if (!response.ok) {
          setError(data.error ?? 'Activation failed');

          return;
        }

        if (data.enterpriseKey && data.licensee && data.subscriptionId) {
          setResult({
            enterpriseKey: data.enterpriseKey,
            licensee: data.licensee,
            subscriptionId: data.subscriptionId,
          });
        } else {
          setError('Activation response was incomplete.');
        }
      } catch {
        if (abortController.signal.aborted) {
          return;
        }

        setError('Failed to activate enterprise key. Please try again.');
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void activate();

    return () => {
      abortController.abort();
    };
  }, [sessionId]);

  const handleCopy = async () => {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result.enterpriseKey);
    setCopied(true);
    timeoutRegistry.schedule(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <ContentStack>
      {loading && (
        <Body
          body={{ text: msg`Activating your enterprise license…` }}
          renderText={renderText}
          size="sm"
          variant="body-paragraph"
        />
      )}

      {error !== null && <ErrorBox>{error}</ErrorBox>}

      {result !== null && (
        <>
          <Body
            body={{
              text: msg`Your enterprise license has been activated successfully.`,
            }}
            className={successLeadClassName}
            renderText={renderText}
            size="md"
            weight="medium"
          />

          <LicenseeRow>
            <Body
              as="span"
              body={{ text: msg`Licensee:` }}
              renderText={renderText}
              size="sm"
              weight="medium"
            />{' '}
            <LicenseeValue>{result.licensee}</LicenseeValue>
          </LicenseeRow>

          <KeySection>
            <Heading
              as="h2"
              renderText={renderText}
              segments={{ fontFamily: 'sans', text: msg`Your enterprise key` }}
              size="xs"
              weight="medium"
            />
            <Body
              body={{
                text: msg`Copy this key and paste it into your Twenty self-hosted instance settings.`,
              }}
              renderText={renderText}
              size="sm"
              variant="body-paragraph"
            />

            <KeyBlock>
              {result.enterpriseKey}
              <CopyTrigger
                $copied={copied}
                data-color="primary"
                data-size="small"
                data-variant="contained"
                onClick={() => void handleCopy()}
                type="button"
              >
                <BaseButton
                  color="primary"
                  label={renderText(copied ? msg`Copied!` : msg`Copy`)}
                  size="small"
                  variant="contained"
                />
              </CopyTrigger>
            </KeyBlock>
          </KeySection>

          <NextStepsBox>
            <Heading
              as="h3"
              renderText={renderText}
              segments={{ fontFamily: 'sans', text: msg`Next steps` }}
              size="xs"
              weight="medium"
            />
            <NextStepsList>
              <li className={nextStepItemClassName}>
                <Body
                  body={{ text: msg`Copy the enterprise key above.` }}
                  renderText={renderText}
                  size="sm"
                />
              </li>
              <li className={nextStepItemClassName}>
                <Body
                  body={{
                    text: msg`Open your Twenty self-hosted instance Settings → Enterprise.`,
                  }}
                  renderText={renderText}
                  size="sm"
                />
              </li>
              <li className={nextStepItemClassName}>
                <Body
                  body={{ text: msg`Paste the key and click Activate.` }}
                  renderText={renderText}
                  size="sm"
                />
              </li>
            </NextStepsList>
          </NextStepsBox>
        </>
      )}
    </ContentStack>
  );
}
