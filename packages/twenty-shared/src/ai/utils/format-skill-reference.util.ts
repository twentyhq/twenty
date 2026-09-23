export const formatSkillReference = ({
  skillId,
  label,
}: {
  skillId: string;
  label: string;
}): string => `[[skill:${skillId}:${label}]]`;
