const config = require("./utils/config");
const app = require("./app");
const http = require("http");
const mongoose = require("mongoose");
const logger = require("./utils/logger");

const server = http.createServer(app);

mongoose.connection.once("open", () => {
  server.listen(config.PORT, () => {
    logger.info(`Server started and listening on port ${config.PORT}`);
  });
});
