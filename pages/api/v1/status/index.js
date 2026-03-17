import { createRouter } from "next-connect";
import database from "infra/database.js";
import controller from "infra/controller.js";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const updatedAt = new Date().toISOString();
  const databaseName = process.env.POSTGRES_DB;
  const dbInfo = await getDatabaseInfo(databaseName);

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: dbInfo,
    },
  });
}

async function getDatabaseInfo(databaseName) {
  const queries = {
    version: "SHOW server_version;",
    maxConnections: "SHOW max_connections;",
    openedConnections: {
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    },
  };

  const versionResult = await database.query(queries.version);
  const maxConnectionsResult = await database.query(queries.maxConnections);
  const openedConnectionsResult = await database.query(
    queries.openedConnections,
  );

  return {
    version: versionResult.rows[0].server_version,
    max_connections: parseInt(maxConnectionsResult.rows[0].max_connections),
    opened_connections: openedConnectionsResult.rows[0].count,
  };
}
