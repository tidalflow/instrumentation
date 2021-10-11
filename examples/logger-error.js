process.env.NODE_ENV = "production";
const { logger } = require("../src/main");

logger.error(new Error("some message"));
logger.info("h123llo", new Error("someting"));

setTimeout(() => {
  console.log(!23);
}, 10000);
