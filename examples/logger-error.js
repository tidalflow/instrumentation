process.env.NODE_ENV = "production";
const { logger } = require("../src/main");

//logger.error(new Error("some message"));
logger.info("hello", new Error("someting"));

setTimeout(() => {
  process.exit(1);
}, 1000);
