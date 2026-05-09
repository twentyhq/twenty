'use client';

import { msg } from '@lingui/core/macro';
import {
  BaseButton,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import { Body, Heading, HeadingPart } from '@/design-system/components';
import { useLingui } from '@lingui/react';
import { useTimeoutRegistry } from '@/lib/react';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { useEnterpriseActivation } from './use-enterprise-activation';

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
  const { i18n } = useLingui();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const timeoutRegistry = useTimeoutRegistry();
  const { result, error, loading } = useEnterpriseActivation(sessionId);
  const [copied, setCopied] = useState(false);

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
        <Body size="sm" variant="body-paragraph">
          {i18n._(msg`Activating your enterprise license…`)}
        </Body>
      )}

      {error !== null && <ErrorBox>{error}</ErrorBox>}

      {result !== null && (
        <>
          <Body className={successLeadClassName} size="md" weight="medium">
            {i18n._(
              msg`Your enterprise license has been activated successfully.`,
            )}
          </Body>

          <LicenseeRow>
            <Body as="span" size="sm" weight="medium">
              {i18n._(msg`Licensee:`)}
            </Body>{' '}
            <LicenseeValue>{result.licensee}</LicenseeValue>
          </LicenseeRow>

          <KeySection>
            <Heading as="h2" size="xs" weight="medium">
              <HeadingPart fontFamily="sans">
                {i18n._(msg`Your enterprise key`)}
              </HeadingPart>
            </Heading>
            <Body size="sm" variant="body-paragraph">
              {i18n._(
                msg`Copy this key and paste it into your Twenty self-hosted instance settings.`,
              )}
            </Body>

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
                  label={i18n._(copied ? msg`Copied!` : msg`Copy`)}
                  size="small"
                  variant="contained"
                />
              </CopyTrigger>
            </KeyBlock>
          </KeySection>

          <NextStepsBox>
            <Heading as="h3" size="xs" weight="medium">
              <HeadingPart fontFamily="sans">
                {i18n._(msg`Next steps`)}
              </HeadingPart>
            </Heading>
            <NextStepsList>
              <li className={nextStepItemClassName}>
                <Body size="sm">
                  {i18n._(msg`Copy the enterprise key above.`)}
                </Body>
              </li>
              <li className={nextStepItemClassName}>
                <Body size="sm">
                  {i18n._(
                    msg`Open your Twenty self-hosted instance Settings → Enterprise.`,
                  )}
                </Body>
              </li>
              <li className={nextStepItemClassName}>
                <Body size="sm">
                  {i18n._(msg`Paste the key and click Activate.`)}
                </Body>
              </li>
            </NextStepsList>
          </NextStepsBox>
        </>
      )}
    </ContentStack>
  );
}
