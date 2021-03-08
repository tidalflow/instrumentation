# @bedrockio/instrumentation

This providers tools to instrumentate your api

- Expose logger (wrapping https://getpino.io)
- Http middleware
- Providers tracing of your application via https://opentelemetry.io/

For exporting both logging and tracing:
The package assumes you are running in a Google Cloud environment (production).
Locally its using https://zipkin.io/. If a server is available.

## Install

```bash
npm install @bedrockio/instrumentation
```

## Usage

**Important** This should be initalized before any other code is executed / required or it will not work correctly.

```javascript
const { initalizeTelemetry } = require("bedrockio/instrumentation");
initalizeTelemetry();
// other code
```

### Methods

#### initalizeTelemetry

Initialize the instrumentations.

#### getTracer

Returns a tracer from the global tracer provider

#### createLogger

```
createLogger(props): Logger
```

Create a new logger instance

#### loggingMiddleware

Http logging middleware

### Propterties

#### logger

```
logger.info("Hello", { "foo": "bar" })
```

The default logger

# Zipkin Server

Start the server by running (needs to be running before the server starts)

`docker run -d -p 9411:9411 openzipkin/zipkin`

And then open the browser `http://your_host:9411`
