'use client';

import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { styled } from '@linaria/react';

import { localizeHref } from '@/platform/i18n/localize-href';
import { useLocale } from '@/platform/i18n/use-locale';
import {
  color,
  fontFamily,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { ExternalLink, Field, NumberField, TextField } from '@/ui';

import { PARTNER_APPLICATION_COPY } from '../../partner-application-copy';
import { type PartnerApplicationController } from '../../use-partner-application-state';

const FIELDS = PARTNER_APPLICATION_COPY.fields;

const ACCEPTS_TERMS_LABEL_ID = 'partner-application-accepts-terms-label';

// A div, not a label: a link inside a label makes a click ambiguous.
const TermsRow = styled.div`
  ${typeRampDeclarations('bodyXs')}
  align-items: center;
  color: ${semanticColor.inkMuted};
  display: flex;
  font-family: ${fontFamily('sans')};
  gap: ${spacing(2)};

  & > input {
    accent-color: ${color('blue')};
    cursor: pointer;
    height: 16px;
    width: 16px;
  }
`;

// Opens in a new tab so the applicant keeps what they typed.
const TermsLink = styled(ExternalLink)`
  color: ${color('blue')};
  text-decoration: underline;
  text-underline-offset: 2px;
`;

export function CommercialsStep({
  controller,
}: {
  controller: PartnerApplicationController;
}) {
  const { i18n } = useLingui();
  const locale = useLocale();
  const { setAcceptsTerms, setField, state } = controller;

  return (
    <>
      <Field label={i18n._(FIELDS.hourlyRate)}>
        <NumberField
          ariaLabel={i18n._(FIELDS.hourlyRate)}
          invalid={state.fieldErrors.hourlyRate !== undefined}
          name="hourlyRate"
          onValueChange={(value) => setField('hourlyRate', value)}
          placeholder={i18n._(FIELDS.hourlyRatePlaceholder)}
          prefix="$"
          value={state.hourlyRate}
        />
      </Field>
      <Field label={i18n._(FIELDS.projectBudgetMin)}>
        <NumberField
          ariaLabel={i18n._(FIELDS.projectBudgetMin)}
          invalid={state.fieldErrors.projectBudgetMin !== undefined}
          name="projectBudgetMin"
          onValueChange={(value) => setField('projectBudgetMin', value)}
          placeholder={i18n._(FIELDS.projectBudgetMinPlaceholder)}
          prefix="$"
          value={state.projectBudgetMin}
        />
      </Field>
      <Field>
        <TextField
          ariaLabel={i18n._(FIELDS.calendarLink)}
          inputMode="url"
          invalid={state.fieldErrors.calendarLink !== undefined}
          name="calendarLink"
          onValueChange={(value) => setField('calendarLink', value)}
          placeholder={i18n._(FIELDS.calendarLink)}
          value={state.calendarLink}
        />
      </Field>
      <TermsRow>
        <input
          aria-invalid={state.fieldErrors.acceptsTerms !== undefined}
          aria-labelledby={ACCEPTS_TERMS_LABEL_ID}
          checked={state.acceptsTerms}
          name="acceptsTerms"
          onChange={(event) => setAcceptsTerms(event.target.checked)}
          type="checkbox"
        />
        <span id={ACCEPTS_TERMS_LABEL_ID}>
          <Trans>
            I agree to the{' '}
            <TermsLink href={localizeHref(locale, '/partners/terms')}>
              Partner Program Terms
            </TermsLink>
          </Trans>
        </span>
      </TermsRow>
    </>
  );
}
