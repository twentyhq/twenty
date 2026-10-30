'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type FormEvent, useState } from 'react';
import { isNonEmptyString } from 'twenty-shared/utils';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  mediaUp,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { Button, Field, Heading, Select, TextareaField, TextField } from '@/ui';

import { AFFILIATE_APPLICATION_COPY } from './affiliate-application-copy';
import { affiliateApplicationRequestSchema } from './affiliate-application-request-schema';
import {
  AFFILIATE_PARTNER_TYPE_OPTIONS,
  type AffiliatePartnerTypeValue,
} from './data/affiliate-partner-type-options';

const COPY = AFFILIATE_APPLICATION_COPY;

const FormGrid = styled.form`
  column-gap: ${spacing(4)};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: ${spacing(4)};
  text-align: start;

  ${mediaUp('sm')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const FullWidth = styled.div`
  ${mediaUp('sm')} {
    grid-column: 1 / -1;
  }
`;

const Footer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  row-gap: ${spacing(4)};

  ${mediaUp('md')} {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
  }
`;

const CheckboxStack = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: ${spacing(2)};
`;

const CheckboxLabel = styled.label`
  ${typeRampDeclarations('bodyXs')}
  align-items: center;
  color: ${semanticColor.inkMuted};
  cursor: pointer;
  display: flex;
  font-family: ${fontFamily('sans')};
  gap: ${spacing(2)};

  & > input {
    accent-color: ${color('blue')};
    height: 16px;
    width: 16px;
  }
`;

const ErrorBanner = styled.p`
  ${typeRampDeclarations('bodyXs')}
  color: ${color('error')};
  font-family: ${fontFamily('sans')};
  font-weight: ${FONT_WEIGHT.medium};
`;

const SuccessStack = styled.div`
  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

type FieldWithError = keyof typeof AFFILIATE_APPLICATION_COPY.errors;

const isFieldWithError = (field: unknown): field is FieldWithError =>
  typeof field === 'string' && field in AFFILIATE_APPLICATION_COPY.errors;

type FormState = {
  name: string;
  email: string;
  partnerType: AffiliatePartnerTypeValue | '';
  mainChannel: string;
  audienceSize: string;
  country: string;
  promotionPlan: string;
  isIntegrationPartner: boolean;
  acceptsTerms: boolean;
};

const INITIAL_STATE: FormState = {
  name: '',
  email: '',
  partnerType: '',
  mainChannel: '',
  audienceSize: '',
  country: '',
  promotionPlan: '',
  isIntegrationPartner: false,
  acceptsTerms: false,
};

// The route's schema is strict and rejects an empty optional, so blanks are
// dropped rather than sent as ''.
function buildRequestBody(state: FormState) {
  const trimmedChannel = state.mainChannel.trim();
  const trimmedAudience = state.audienceSize.trim();
  const trimmedCountry = state.country.trim();
  const trimmedPlan = state.promotionPlan.trim();

  return {
    name: state.name.trim(),
    email: state.email.trim(),
    partnerType: state.partnerType,
    ...(isNonEmptyString(trimmedChannel) && { mainChannel: trimmedChannel }),
    ...(isNonEmptyString(trimmedAudience) && { audienceSize: trimmedAudience }),
    ...(isNonEmptyString(trimmedCountry) && { country: trimmedCountry }),
    ...(isNonEmptyString(trimmedPlan) && { promotionPlan: trimmedPlan }),
    ...(state.isIntegrationPartner && { isIntegrationPartner: true }),
    acceptsTerms: state.acceptsTerms,
  };
}

export function AffiliateApplicationForm() {
  const { i18n } = useLingui();
  const [state, setState] = useState<FormState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setField = <TKey extends keyof FormState>(
    key: TKey,
    value: FormState[TKey],
  ) => setState((current) => ({ ...current, [key]: value }));

  // Same schema as the API route, so anything it would reject gets a
  // field-specific message here instead of a generic failure.
  const validate = () => {
    const result = affiliateApplicationRequestSchema.safeParse(
      buildRequestBody(state),
    );

    if (result.success) {
      return null;
    }

    const field = result.error.issues[0]?.path[0];

    return i18n._(
      isFieldWithError(field) ? COPY.errors[field] : COPY.errors.unexpected,
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validate();
    if (validationError !== null) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/affiliate-application', {
        body: JSON.stringify(buildRequestBody(state)),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (!response.ok) {
        setErrorMessage(i18n._(COPY.errors.unexpected));
        return;
      }

      setIsSubmitted(true);
      setState(INITIAL_STATE);
    } catch {
      setErrorMessage(i18n._(COPY.errors.unexpected));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <SuccessStack role="status">
        <Heading as="h3" size="xs" weight="regular">
          {i18n._(COPY.successHeading)}
        </Heading>
      </SuccessStack>
    );
  }

  return (
    <FormGrid noValidate onSubmit={handleSubmit}>
      <Field label={i18n._(COPY.fields.name)}>
        <TextField
          ariaLabel={i18n._(COPY.fields.name)}
          name="name"
          onValueChange={(value) => setField('name', value)}
          value={state.name}
        />
      </Field>
      <Field label={i18n._(COPY.fields.email)}>
        <TextField
          ariaLabel={i18n._(COPY.fields.email)}
          inputMode="email"
          name="email"
          onValueChange={(value) => setField('email', value)}
          value={state.email}
        />
      </Field>
      <Field label={i18n._(COPY.fields.partnerType)}>
        <Select
          ariaLabel={i18n._(COPY.fields.partnerType)}
          onValueChange={(value) => setField('partnerType', value)}
          options={AFFILIATE_PARTNER_TYPE_OPTIONS.map((option) => ({
            label: i18n._(option.label),
            value: option.value,
          }))}
          placeholder={i18n._(COPY.fields.partnerTypePlaceholder)}
          value={state.partnerType}
        />
      </Field>
      <Field label={i18n._(COPY.fields.mainChannel)}>
        <TextField
          ariaLabel={i18n._(COPY.fields.mainChannel)}
          inputMode="url"
          name="mainChannel"
          onValueChange={(value) => setField('mainChannel', value)}
          placeholder={i18n._(COPY.fields.mainChannelPlaceholder)}
          value={state.mainChannel}
        />
      </Field>
      <Field label={i18n._(COPY.fields.audienceSize)}>
        <TextField
          ariaLabel={i18n._(COPY.fields.audienceSize)}
          name="audienceSize"
          onValueChange={(value) => setField('audienceSize', value)}
          placeholder={i18n._(COPY.fields.audienceSizePlaceholder)}
          value={state.audienceSize}
        />
      </Field>
      <Field label={i18n._(COPY.fields.country)}>
        <TextField
          ariaLabel={i18n._(COPY.fields.country)}
          name="country"
          onValueChange={(value) => setField('country', value)}
          value={state.country}
        />
      </Field>
      <FullWidth>
        <Field label={i18n._(COPY.fields.promotionPlan)}>
          <TextareaField
            ariaLabel={i18n._(COPY.fields.promotionPlan)}
            name="promotionPlan"
            onValueChange={(value) => setField('promotionPlan', value)}
            placeholder={i18n._(COPY.fields.promotionPlanPlaceholder)}
            value={state.promotionPlan}
          />
        </Field>
      </FullWidth>
      <FullWidth>
        <Footer>
          <CheckboxStack>
            <CheckboxLabel>
              <input
                checked={state.isIntegrationPartner}
                name="isIntegrationPartner"
                onChange={(event) =>
                  setField('isIntegrationPartner', event.target.checked)
                }
                type="checkbox"
              />
              {i18n._(COPY.fields.isIntegrationPartner)}
            </CheckboxLabel>
            <CheckboxLabel>
              <input
                checked={state.acceptsTerms}
                name="acceptsTerms"
                onChange={(event) =>
                  setField('acceptsTerms', event.target.checked)
                }
                type="checkbox"
              />
              {i18n._(COPY.fields.acceptsTerms)}
            </CheckboxLabel>
          </CheckboxStack>
          <Button
            disabled={isSubmitting}
            label={i18n._(isSubmitting ? COPY.submitting : COPY.submit)}
            type="submit"
          />
        </Footer>
      </FullWidth>
      {errorMessage !== null ? (
        <FullWidth>
          <ErrorBanner role="alert">{errorMessage}</ErrorBanner>
        </FullWidth>
      ) : null}
    </FormGrid>
  );
}
