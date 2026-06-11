import { type ReactElement } from 'react';

import styles from './CommandBlock.module.scss';

type CommandBlockProps = {
  commands: string[];
  button?: ReactElement;
};

export const CommandBlock = ({ commands, button }: CommandBlockProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.commandContain}>
        <>
          {commands.map((line, i) => (
            <div key={i}>
              <span className={styles.lineStartSpan}>{'> '}</span>
              <span className={styles.lineSpan}>{line}</span>
            </div>
          ))}
        </>
      </div>
      {button && <div className={styles.buttonContainer}>{button}</div>}
    </div>
  );
};
