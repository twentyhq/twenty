import styles from './ButtonText.module.scss';

export const ButtonText = ({
  hasIcon = false,
  isLoading,
  title,
}: {
  isLoading?: boolean;
  hasIcon: boolean;
  title?: string;
}) => {
  return (
    <div className={styles.textWrapper}>
      <div
        className={styles.text}
        data-loading={isLoading || undefined}
        data-has-icon={hasIcon || undefined}
      >
        {title}
      </div>
      <div className={styles.ellipsis} data-loading={isLoading || undefined}>
        ...
      </div>
    </div>
  );
};
