import { compileCampaignEmailContent } from 'src/modules/emailing/utils/compile-campaign-email-content.util';
import { renderCampaignTemplate } from 'src/modules/emailing/utils/render-campaign-template.util';

export const renderCampaignEmail = async ({
  subjectTemplate,
  bodyTemplate,
  variables,
}: {
  subjectTemplate: string;
  bodyTemplate: string;
  variables: Record<string, string>;
}): Promise<{ subject: string; html: string; plainText: string }> => {
  const { html, plainText } = await compileCampaignEmailContent(
    bodyTemplate,
    variables,
  );

  return {
    subject: renderCampaignTemplate(subjectTemplate, variables, {
      escapeValues: false,
    }),
    html,
    plainText,
  };
};
