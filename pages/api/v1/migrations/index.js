import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
  const dbClient = await database.getNerwClient();

  if (request.method === "GET") {
    const pendingMigrations = await runMigrations(true, dbClient);
    await dbClient.end();

    return response.status(200).json(pendingMigrations);
  }
  if (request.method === "POST") {
    const migratedMigrations = await runMigrations(false, dbClient);
    await dbClient.end();

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }

    return response.status(200).json(migratedMigrations);
  }

  return response.status(405).end();
}

async function runMigrations(dryRun, dbClient) {
  const migrations = await migrationRunner({
    dbClient: dbClient,
    dryRun: dryRun,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  });

  return migrations;
}
