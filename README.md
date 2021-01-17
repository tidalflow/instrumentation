# @bedrockio/instrumentation

This auto instrumentations your code, the packages wrappers https://opentelemetry.io/ with a few default plugins.
The packages assumes you are running in a Google Cloud environment for reporting in production. Controlled with NODE_ENV flags.
Locally its using https://zipkin.io/.

## Install

```bash
npm install @bedrockio/instrumentation
```

# Zipkin Server

Start the server by running (needs to be running before the server starts)

`docker run -d -p 9411:9411 openzipkin/zipkin`

And then open the browser `http://your_host:9411`

## Usage

**Important** This should be initalized before any other code is executed / required or it will not work correctly.

```javascript
const { initalize } = require("bedrockio/instrumentation");
initalize();
// other code
```

### Methods

#### initalize

Initialize the instrumentations.

#### getTracer

Returns a tracer from the global tracer provider
