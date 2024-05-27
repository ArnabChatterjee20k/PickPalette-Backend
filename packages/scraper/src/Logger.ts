import * as winston from "winston";
import "winston-mongodb";
import { MongoClient } from "mongodb";

type Message = Object

class BaseLogger {
  protected logger: winston.Logger;

  log(message: Message, level: string = "info") {
    this.logger.log(level, message);
    this.logger.end();
  }

  error(message: Message) {
    this.logger.error(message);
    this.logger.end();
  }

  warn(message: Message) {
    this.logger.warn(message);
    this.logger.end();
  }

  info(message: Message) {
    this.logger.info(message);
    this.logger.end();
  }

  debug(message: Message) {
    this.logger.debug(message);
    this.logger.end();
  }
}

class ConsoleLogger extends BaseLogger {
  protected logger: winston.Logger;

  constructor() {
    super();
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.simple(),
      transports: [new winston.transports.Console()],
    });
  }

  public getLogger() {
    return this.logger;
  }
}

class DBLogger extends BaseLogger {
  protected logger: winston.Logger;
  protected consoleLogger: ConsoleLogger;
  private url: string;
  constructor() {
    super();
    this.url = process.env.MONGODB_URI;
    this.consoleLogger = new ConsoleLogger();
    this.logger = winston.createLogger({
      level: "info",
      transports: [
        // write errors to console too
        new winston.transports.Console({
          format: winston.format.simple(),
          level: "error",
        }),
      ],
    });
  }

  async connectToDatabase(collectionName: string) {
    this.consoleLogger.info(`${collectionName} Logger database setuped`);
    try {
      const url = this.url;
      const client = new MongoClient(url);
      await client.connect();
      const transportOptions = {
        db: await Promise.resolve(client),
        collection: collectionName,
      };
      // @ts-ignore
      this.logger.add(new winston.transports.MongoDB(transportOptions));
    } catch (error) {
      this.consoleLogger.error(
        `Error connecting to ${collectionName} Logger database: ${error}`
      );
      this.consoleLogger.info("Using Console logger");
      this.logger = this.consoleLogger.getLogger();
    }
    return this;
  }
}

export async function getLogger(collectionName: string) {
  const logger = new DBLogger();
  return await logger.connectToDatabase(collectionName);
}

export type Logger = Promise<winston.Logger>;
