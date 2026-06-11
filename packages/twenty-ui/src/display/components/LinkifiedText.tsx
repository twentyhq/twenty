import { isNonEmptyString } from '@sniptt/guards';

import { linkifyText } from '@ui/utilities/utils/linkifyText';

import styles from './LinkifiedText.module.scss';

type LinkifiedTextProps = {
  text: string;
};

export const LinkifiedText = ({ text }: LinkifiedTextProps) => {
  if (!isNonEmptyString(text)) {
    return null;
  }

  return (
    <>
      {linkifyText(text).map((part, index) =>
        part.type === 'link' ? (
          <a
            key={index}
            className={styles.link}
            href={part.content}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {part.content}
          </a>
        ) : (
          part.content
        ),
      )}
    </>
  );
};
