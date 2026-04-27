import { type ReactNode } from 'react';

import { FooterVisibilityGate } from '@/app/_components/FooterVisibilityGate';
import { ScrollToTopOnRouteChange } from '@/app/_components/ScrollToTopOnRouteChange';
import { ContactCalModalRoot } from '@/lib/contact-cal';
import {
  APP_LOCALE_LIST,
  HtmlLangSetter,
  I18nProvider,
  getLocaleMessages,
  resolveLocaleParam,
} from '@/lib/i18n';
import { PartnerApplicationModalRoot } from '@/lib/partner-application';
import { Footer } from '@/sections/Footer/components';
import { FOOTER_DATA } from '@/sections/Footer/data';

type LocaleLayoutParams = { locale: string };

export const generateStaticParams = (): LocaleLayoutParams[] =>
  APP_LOCALE_LIST.map((locale) => ({ locale }));

const LocaleLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<LocaleLayoutParams>;
}) => {
  const { locale: rawLocale } = await params;
  const locale = resolveLocaleParam(rawLocale);
  const messages = getLocaleMessages(locale);

  return (
    <I18nProvider locale={locale} messages={messages}>
      <HtmlLangSetter locale={locale} />
      <ContactCalModalRoot>
        <PartnerApplicationModalRoot>
          <ScrollToTopOnRouteChange />
          {children}
          <FooterVisibilityGate>
            <Footer.Root>
              <Footer.Logo />
              <Footer.Nav groups={FOOTER_DATA.navGroups} />
              <Footer.Bottom
                copyright={FOOTER_DATA.bottom.copyright}
                links={FOOTER_DATA.socialLinks}
              />
            </Footer.Root>
          </FooterVisibilityGate>
        </PartnerApplicationModalRoot>
      </ContactCalModalRoot>
    </I18nProvider>
  );
};

export default LocaleLayout;
