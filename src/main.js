const opentelemetry = require("@opentelemetry/api");

const { NodeTracerProvider } = require("@opentelemetry/node");
const { SimpleSpanProcessor } = require("@opentelemetry/tracing");
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

function setupTelemetry(
  {
    http = {
      ignoreIncomingPaths: ["/"],
      ignoreOutgoingUrls: [],
    },
  } = { http: {} }
) {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const provider = new NodeTracerProvider({
    plugins: {
      koa: {
        enabled: true,
        path: "@opentelemetry/koa-instrumentation",
        enhancedDatabaseReporting: true,
      },
      http: {
        // You may use a package name or absolute path to the file.
        path: "@opentelemetry/plugin-http",
        // http plugin options
        ...http,
      },
    },
  });

  const {
    TraceExporter,
  } = require("@google-cloud/opentelemetry-cloud-trace-exporter");

  // Configure the span processor to send spans to the exporter
  provider.addSpanProcessor(new SimpleSpanProcessor(new TraceExporter()));

  return provider.register();
}

exports.setupTelemetry = setupTelemetry;

exports.initalize = exports.initialize = function (args) {
  console.warn(
    `@bedrockio/instrumentation "initialize" is deprecated please use "setupTelemetry" instead.`
  );
  setupTelemetry(args);
};
