import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { SITE_URLS } from '@/platform/site-urls';
import { ExternalLink } from '@/ui';

export function SupportDocument() {
  return (
    <>
      <p>
        Twenty is an open-source CRM. This page explains how to get help,
        whether you run Twenty on our cloud or host it yourself.
      </p>

      <h2>Getting help</h2>
      <p>
        You don&rsquo;t need a Twenty account to contact us. Email{' '}
        <a href="mailto:contact@twenty.com">contact@twenty.com</a> and
        we&rsquo;ll get back to you.
      </p>

      <h3>Twenty Cloud</h3>
      <p>
        If you&rsquo;re on{' '}
        <ExternalLink href={SITE_URLS.appWelcome}>Twenty Cloud</ExternalLink>,
        open Settings and select Support to reach us, or email{' '}
        <a href="mailto:contact@twenty.com">contact@twenty.com</a> with your
        workspace URL so we can find your account.
      </p>

      <h3>Self-hosted</h3>
      <p>
        If you host Twenty yourself, start with the{' '}
        <ExternalLink href={SITE_URLS.docsSelfHost}>
          self-hosting documentation
        </ExternalLink>
        . For questions and bug reports, email{' '}
        <a href="mailto:contact@twenty.com">contact@twenty.com</a>, open an
        issue on{' '}
        <ExternalLink href="https://github.com/twentyhq/twenty/issues">
          GitHub
        </ExternalLink>
        , or ask the community on{' '}
        <ExternalLink href={SITE_URLS.discord}>Discord</ExternalLink>.
      </p>

      <h2>Reporting a problem</h2>
      <p>To help us resolve issues quickly, include:</p>
      <ul>
        <li>
          Whether you&rsquo;re on Twenty Cloud or self-hosted (and the version,
          if self-hosted).
        </li>
        <li>
          Your workspace URL, and the Slack workspace if the issue is with the
          Slack app.
        </li>
        <li>What you expected to happen and what happened instead.</li>
        <li>The steps to reproduce it.</li>
        <li>When it happened, including your timezone.</li>
        <li>Any screenshots or error messages.</li>
      </ul>
      <p>
        <strong>
          Remove passwords, API keys, tokens, payment details, and any
          confidential information
        </strong>{' '}
        before sending screenshots or logs.
      </p>

      <h2>Privacy and terms</h2>
      <p>
        See our{' '}
        <LocalizedLink href="/privacy-policy">Privacy Policy</LocalizedLink> and{' '}
        <LocalizedLink href="/terms">Terms of Service</LocalizedLink> for how we
        handle your data and the terms that govern your use of Twenty. For
        security disclosures, see our{' '}
        <ExternalLink href={SITE_URLS.trustCenter}>Trust Center</ExternalLink>.
      </p>
    </>
  );
}
