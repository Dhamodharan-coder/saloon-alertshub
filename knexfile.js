require("dotenv").config({ path: ".env" });
const path = require("path");

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  NODE_ENV = "development",
} = process.env;

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "postgresql",
    connection: {
      database: DB_DATABASE,
      user: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: DB_PORT,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, "db/migrations"),
      tableName: "knex_migrations",
    },
    seeds: {
      directory: path.join(__dirname, "db/seeds"),
    },
  },

  production: {
    client: "postgresql",
    connection: {
      database: DB_DATABASE,
      user: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: DB_PORT,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 2,
      max: 20,
    },
    migrations: {
      directory: path.join(__dirname, "db/migrations"),
      tableName: "knex_migrations",
    },
    seeds: {
      directory: path.join(__dirname, "db/seeds"),
    },
  },

  test: {
    client: "postgresql",
    connection: {
      database: `${DB_DATABASE}_test`,
      user: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: DB_PORT,
    },
    pool: {
      min: 0,
      max: 5,
    },
    migrations: {
      directory: path.join(__dirname, "db/migrations"),
      tableName: "knex_migrations",
    },
    seeds: {
      directory: path.join(__dirname, "db/seeds"),
    },
  },
};
