import { NextResponse } from 'next/server';

type EnterpriseConfigCheck = {
  route: string;
  feature: string;
  requiredEnvVars: string[];
};

export function getEnterpriseConfigError({
  route,
  feature,
  requiredEnvVars,
}: EnterpriseConfigCheck): NextResponse | null {
  const missingEnvVars = requiredEnvVars.filter(
    (envVarName) => !process.env[envVarName],
  );

  if (missingEnvVars.length === 0) {
    return null;
  }

  console.error(
    `[${route}] 503 — ${missingEnvVars.join(', ')} ${
      missingEnvVars.length === 1 ? 'is' : 'are'
    } not configured`,
  );

  return NextResponse.json(
    { error: `${feature} is not configured.` },
    { status: 503 },
  );
}
