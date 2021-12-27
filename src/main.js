const opentelemetry = require("@opentelemetry/api");

const { logger, createLogger, loggingMiddleware } = require("./logging");

/**
 * Returns a tracer from the global tracer provider
 * @param {string} [name]
 * @returns {opentelemetry.Tracer}
 */
exports.getTracer = function (name = "global") {
  return opentelemetry.trace.getTracer(name);
};

exports.logger = logger;
exports.createLogger = createLogger;
exports.loggingMiddleware = loggingMiddleware;

function setupTelemetry(options = {}) {
  const {
    HttpInstrumentation,
  } = require("@opentelemetry/instrumentation-http");
  const { KoaInstrumentation } = require("@opentelemetry/instrumentation-koa");
  const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
  const {
    registerInstrumentations,
  } = require("@opentelemetry/instrumentation");

  const {
    TraceExporter,
  } = require("@google-cloud/opentelemetry-cloud-trace-exporter");

  const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");

  const provider = new NodeTracerProvider();
  provider.register();

  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation({
        ...options.http,
      }),
      new KoaInstrumentation({
        ...options.koa,
      }),
    ],
    tracerProvider: provider,
  });

  // Configure the span processor to send spans to the exporter
  provider.addSpanProcessor(new BatchSpanProcessor(new TraceExporter()));
  // provider.addSpanProcessor(new BatchSpanProcessor(new ConsoleSpanExporter()));

  return provider.register();
}

exports.setupTelemetry = setupTelemetry;

exports.initalize = exports.initialize = function (args) {
  console.warn(
    `@bedrockio/instrumentation "initialize" is deprecated please use "setupTelemetry" instead.`
  );
  setupTelemetry(args);
};
