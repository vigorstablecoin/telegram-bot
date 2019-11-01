import path from 'path'
import { createConnection, getConnection, ConnectionOptions, getConnectionOptions } from "typeorm";
import { logger } from "./logger";
import { isProduction } from './utils';

let connection = null;

const fileName = `telegram.sqlite`;
// CHANGEME: depending on where you want to log on production
const dbPath =
  isProduction()
    ? `/storage/${fileName}`
    : `${fileName}`;


logger.info(`Database path: ${path.resolve(dbPath)}`)

export const getDb = async () => {
  if (!connection) {
    // get options from ormconfig.json
    let options = (await getConnectionOptions().catch(() => ({}))) as ConnectionOptions

    connection = await createConnection({
      ...options,
      type: `sqlite`,
      database: dbPath,
    });
    await connection.runMigrations();
  }

  return connection;
};
