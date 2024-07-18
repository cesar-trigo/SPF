export const loggerController = (req, res) => {
  req.logger.fatal("Testing fatal");
  req.logger.error("Testing error");
  req.logger.warning("Testing warning");
  req.logger.info("Testing info");
  req.logger.http("Testing http");
  req.logger.debug("Testing debug");

  res.send({ status: "success", message: "Testing logger" });
};
