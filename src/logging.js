const pino = require("pino");
const opentelemetry = require("@opentelemetry/api");

const ENV_NAME = process.env.ENV_NAME || process.env.NODE_ENV;

function getTracerContext() {
  const tracer = opentelemetry.trace.getTracer("http");
  const currentSpan = tracer.getCurrentSpan();
  if (!currentSpan) return null;
  return currentSpan.context();
}

const hooks = {
  logMethod(inputArgs, method) {
    if (inputArgs.length >= 2) {
      const arg1 = inputArgs.shift();
      const arg2 = inputArgs.shift();
      return method.apply(this, [
        {
          details: arg2,
          additionalProps: inputArgs.length ? inputArgs : undefined,
        },
        arg1,
      ]);
    }
    return method.apply(this, inputArgs);
  },
};

const parentLogger = pino({
  messageKey: "message",
  formatters: {
    level(_, level) {
      if (level === 20) {
        return { severity: "debug" };
      }
      if (level === 30) {
        return { severity: "info" };
      }
      if (level === 40) {
        return { severity: "warning" };
      }
      if (level === 50) {
        return { severity: "error" };
      }
      if (level >= 60) {
        return { severity: "critical" };
      }
      return { severity: "default" };
    },
  },
  base: null,
  level: process.env.LOG_LEVEL || "info",
  timestamp: pino.stdTimeFunctions.isoTime,
  hooks,
});

function formatCurrentTrace({ traceId, spanId }) {
  return {
    "logging.googleapis.com/spanId": spanId,
    "logging.googleapis.com/trace": traceId,
    "logging.googleapis.com/trace_sampled": true,
  };
}

/**
 * @returns {import('pino').Logger} Logger
 */
function createLogger(options = {}) {
  const globalContext = getTracerContext();
  const globalContextFields = globalContext
    ? formatCurrentTrace(globalContext)
    : {};

  return parentLogger.child({
    ...globalContextFields,
    ...options,
  });
}

exports.createLogger = createLogger;

const formatters = {
  // https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry
  gcloud: function ({ request, response, latency }) {
    return {
      message: `${request.method} ${request.url} ${
        response.getHeader("content-length") || "?"
      } - ${latency} ms`,
      httpRequest: {
        requestMethod: request.method.toUpperCase(),
        requestUrl: request.url,
        requestSize: request.headers["content-length"],
        status: response.statusCode,
        userAgent: request.headers["user-agent"],
        referer: request.headers["referer"],
        remoteIp: request.headers["x-forwarded-for"],
        latency: `${Math.floor(latency / 1e3)}.${Math.floor(latency % 1e3)}s`,
        protocol: request.headers["x-forwarded-proto"],
        responseSize: response.getHeader("content-length"),
      },
    };
  },
};

function onResFinished(
  loggerInstance,
  httpRequestFormat,
  startTime,
  request,
  response,
  error
) {
  const latency = Date.now() - startTime;
  const isError = response.statusCode == 500 || !!error;

  loggerInstance[isError ? "error" : "info"](
    httpRequestFormat({
      response,
      request,
      latency: latency,
    })
  );
}

exports.loggingMiddleware = function loggingMiddleware(options = {}) {
  const { httpRequestFormat, ignoreUserAgents } = {
    ignoreUserAgents: [
      "GoogleHC/1.0",
      "kube-probe/1.17+",
      "kube-probe/1.16+",
      "kube-probe/1.15+",
    ],
    httpRequestFormat: formatters.gcloud,
    ...options,
  };

  async function loggingMiddlewareInner(ctx, next) {
    if (ignoreUserAgents.includes(ctx.request.get("user-agent"))) {
      return next();
    }

    const { req, res } = ctx;

    const startTime = Date.now();
    const requestLogger = createLogger();

    ctx.logger = requestLogger;

    if (ENV_NAME === "test") {
      return next();
    }

    res.once("finish", () =>
      onResFinished(requestLogger, httpRequestFormat, startTime, req, res)
    );
    res.once("error", (err) =>
      onResFinished(requestLogger, httpRequestFormat, startTime, req, res, err)
    );
    return next();
  }

  return loggingMiddlewareInner;
};

const testLogger = {
  ...parentLogger,
  trace: console.trace,
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
  fatal: console.error,
  version: "console",
};

exports.logger = process.NODE_ENV === "production" ? parentLogger : testLogger;
