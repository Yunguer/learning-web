import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";
import { ServiceError } from "infra/errors.js";

async function runMigrations(dryRun, dbClient) {
  const migrations = await migrationRunner({
    dbClient: dbClient,
    dryRun: dryRun,
    dir: resolve("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  });

  return migrations;
}

async function handleMigrations(dryRun) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const result = await runMigrations(dryRun, dbClient);
    return result;
  } catch (error) {
    const message = dryRun
      ? "Erro ao listar migrações pendentes."
      : "Erro ao executar migrações pendentes.";
    const serviceErrorObject = new ServiceError({
      message,
      cause: error,
    });
    throw serviceErrorObject;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations: () => handleMigrations(true),
  runPendingMigrations: () => handleMigrations(false),
};

export default migrator;
