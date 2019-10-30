import {createConnection, getConnection} from "typeorm";

let connection = null

export const getDb = async () => {
  if(!connection) {
    connection = await createConnection()
    await connection.runMigrations()
  }

  return connection
}
