import { convert } from 'html-to-text';

type AppendSignatureToEmailArgs = {
  html: string;
  text: string;
  signature: string;
};

// Appends an HTML signature to the html + plain-text bodies of an outbound
// email. No-op when the signature is empty or already present in the html
// (avoids double-appending on edited drafts or templated bodies).
export const appendSignatureToEmail = ({
  html,
  text,
  signature,
}: AppendSignatureToEmailArgs): { html: string; text: string } => {
  if (signature.length === 0 || html.includes(signature)) {
    return { html, text };
  }

  const plainTextSignature = convert(signature, { wordwrap: false });

  return {
    html: `${html}<br><br>${signature}`,
    text: `${text}\n\n${plainTextSignature}`,
  };
};
