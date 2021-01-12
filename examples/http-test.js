const { getTracer, initalize } = require("../src/main");
initalize();

const tracer = getTracer("test");

// eslint-disable-next-line import/order
const http = require("http");

/** Starts a HTTP server that receives requests on sample server port. */
function startServer(port) {
  // Creates a server
  const server = http.createServer(handleRequest);
  // Starts the server
  server.listen(port, (err) => {
    if (err) {
      throw err;
    }
    console.log(`Node HTTP listening on ${port}`);
  });
}

/** A function which handles requests and send response. */
function handleRequest(request, response) {
  try {
    const body = [];
    request.on("error", (err) => console.log(err));
    request.on("data", (chunk) => body.push(chunk));
    request.on("end", () => {
      // deliberately sleeping to mock some action.
      setTimeout(() => {
        response.end(`Trace Id: ${tracer.getCurrentSpan().context().traceId}`);
      }, 2000);
    });
  } catch (err) {
    console.error(err);
  }
}

startServer(8080);
