import process from 'process';

import { ExportResultCode } from '@opentelemetry/core';
import opentelemetry from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import {
  AggregationTemporality,
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
  type PushMetricExporter,
  type ResourceMetrics,
} from '@opentelemetry/sdk-metrics';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { ExceptionHandlerDriver } from 'src/engine/core-modules/exception-handler/interfaces';
import { MeterDriver } from 'src/engine/core-modules/metrics/types/meter-driver.type';
import { parseArrayEnvVar } from 'src/utils/parse-array-env-var';

const meterDrivers = parseArrayEnvVar(
  process.env.METER_DRIVER,
  Object.values(MeterDriver),
  [],
);

const OTLP_METRICS_LOG_PREFIX = '[Twenty OTEL metrics]';

const formatOtlEndpointForLog = (rawUrl: string | undefined): string => {
  if (!rawUrl?.trim()) {
    return 'unset';
  }
  try {
    const parsed = new URL(rawUrl);

    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    return 'invalid_url';
  }
};

const serializeOtlExportFailure = (error: unknown): string => {
  if (error === undefined || error === null) {
    return 'none';
  }
  if (error instanceof Error) {
    const base = `${error.name}: ${error.message}`;
    const maybeAggregate = error as Error & { errors?: unknown[] };
    if (
      Array.isArray(maybeAggregate.errors) &&
      maybeAggregate.errors.length > 0
    ) {
      const causes = maybeAggregate.errors.map((cause: unknown) =>
        serializeOtlExportFailure(cause),
      );

      return `${base} | causes=[${causes.join(' | ')}]`;
    }

    return base;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

let otlpMetricsFirstExportSuccessLogged = false;
let otlpMetricsFirstExportAttemptLogged = false;

const wrapOtlMetricExporterWithProcessLogs = (
  inner: OTLPMetricExporter,
  otlpEndpointForLog: string,
): PushMetricExporter => ({
  export(metrics: ResourceMetrics, resultCallback) {
    if (!otlpMetricsFirstExportAttemptLogged) {
      otlpMetricsFirstExportAttemptLogged = true;
      console.log(
        `${OTLP_METRICS_LOG_PREFIX} first periodic export attempt | endpoint=${otlpEndpointForLog}`,
      );
    }
    const totalMetricData = metrics.scopeMetrics.reduce(
      (accumulator, scopeMetric) => accumulator + scopeMetric.metrics.length,
      0,
    );
    inner.export(metrics, (result) => {
      if (result.code === ExportResultCode.SUCCESS) {
        if (!otlpMetricsFirstExportSuccessLogged) {
          otlpMetricsFirstExportSuccessLogged = true;
          // One-time line so prod logs stay usable; further success is silent.
          console.log(
            `${OTLP_METRICS_LOG_PREFIX} first export ok | endpoint=${otlpEndpointForLog} | metricDataPoints=${totalMetricData}`,
          );
        }
      } else {
        console.warn(
          `${OTLP_METRICS_LOG_PREFIX} export failed | endpoint=${otlpEndpointForLog} | metricDataPoints=${totalMetricData} | code=${result.code} | error=${serializeOtlExportFailure(result.error)}`,
        );
      }
      resultCallback(result);
    });
  },
  forceFlush: () => inner.forceFlush(),
  shutdown: () => inner.shutdown(),
  selectAggregationTemporality: (instrumentType) =>
    inner.selectAggregationTemporality(instrumentType),
  selectAggregation: (instrumentType) =>
    inner.selectAggregation(instrumentType),
});

if (process.env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.SENTRY) {
  Sentry.init({
    environment: process.env.SENTRY_ENVIRONMENT,
    release: process.env.APP_VERSION,
    dsn: process.env.SENTRY_DSN,
    integrations: [
      Sentry.redisIntegration(),
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
      Sentry.graphqlIntegration(),
      Sentry.postgresIntegration(),
      Sentry.vercelAIIntegration({
        recordInputs: true,
        recordOutputs: true,
      }),
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.3,
    sendDefaultPii: true,
    debug: process.env.NODE_ENV === NodeEnvironment.DEVELOPMENT,
  });
}

// Meter setup

const otlpCollectorMetricsUrl = process.env.OTLP_COLLECTOR_METRICS_ENDPOINT_URL;
const otlpEndpointForLog = formatOtlEndpointForLog(otlpCollectorMetricsUrl);

if (meterDrivers.includes(MeterDriver.OpenTelemetry)) {
  console.log(
    `${OTLP_METRICS_LOG_PREFIX} OTLP reader enabled | exportIntervalMs=10000 | endpoint=${otlpEndpointForLog} | meterDrivers=${meterDrivers.join(',')}`,
  );
} else {
  console.log(
    `${OTLP_METRICS_LOG_PREFIX} OTLP reader disabled | parsedMeterDrivers=${JSON.stringify(meterDrivers)} | rawMETER_DRIVER=${JSON.stringify(process.env.METER_DRIVER ?? '')}`,
  );
}

const prometheusExporter = meterDrivers.includes(MeterDriver.Prometheus)
  ? new PrometheusExporter({ port: 9464 })
  : null;

const meterProvider = new MeterProvider({
  readers: [
    ...(meterDrivers.includes(MeterDriver.Console)
      ? [
          new PeriodicExportingMetricReader({
            exporter: new ConsoleMetricExporter(),
            exportIntervalMillis: 10000,
          }),
        ]
      : []),
    ...(meterDrivers.includes(MeterDriver.OpenTelemetry)
      ? [
          new PeriodicExportingMetricReader({
            exporter: wrapOtlMetricExporterWithProcessLogs(
              new OTLPMetricExporter({
                url: otlpCollectorMetricsUrl,
                temporalityPreference: AggregationTemporality.DELTA,
              }),
              otlpEndpointForLog,
            ),
            exportIntervalMillis: 10000,
          }),
        ]
      : []),
    ...(prometheusExporter ? [prometheusExporter] : []),
  ],
});

opentelemetry.metrics.setGlobalMeterProvider(meterProvider);

// Always-on gauge so the OTLP exporter fires on every collection tick,
// even when the process is otherwise idle. This guarantees the process-log
// wrapper above can prove connectivity (first export ok / export failed).
if (meterDrivers.includes(MeterDriver.OpenTelemetry)) {
  const heartbeatMeter = opentelemetry.metrics.getMeter(
    'twenty-server-heartbeat',
  );
  const heartbeat = heartbeatMeter.createObservableGauge('twenty.heartbeat', {
    description: 'Always-on gauge (1) to prove OTLP export pipeline',
  });

  heartbeat.addCallback((observableResult) => {
    observableResult.observe(1);
  });
}
