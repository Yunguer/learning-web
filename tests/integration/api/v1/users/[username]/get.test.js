import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous User", () => {
    test("With exact case match", async () => {
      const createdUser = await orchestrator.createUser();

      const secondResponse = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
      );

      expect(secondResponse.status).toBe(200);

      const secondResponseBody = await secondResponse.json();

      expect(secondResponseBody).toEqual({
        id: secondResponseBody.id,
        username: createdUser.username,
        email: createdUser.email,
        password: secondResponseBody.password,
        created_at: secondResponseBody.created_at,
        updated_at: secondResponseBody.updated_at,
      });

      expect(uuidVersion(secondResponseBody.id)).toBe(4);
      expect(Date.parse(secondResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(secondResponseBody.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      const createdUser = await orchestrator.createUser({
        username: "Case_Mismatch_Username",
      });

      const secondResponse = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username.toUpperCase()}`,
      );

      expect(secondResponse.status).toBe(200);

      const secondResponseBody = await secondResponse.json();

      expect(secondResponseBody).toEqual({
        id: secondResponseBody.id,
        username: createdUser.username,
        email: createdUser.email,
        password: secondResponseBody.password,
        created_at: secondResponseBody.created_at,
        updated_at: secondResponseBody.updated_at,
      });

      expect(uuidVersion(secondResponseBody.id)).toBe(4);
      expect(Date.parse(secondResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(secondResponseBody.updated_at)).not.toBeNaN();
    });

    test("With nonexistent username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistent_username",
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Username não encontrado.",
        action: "Verifique o username e tente novamente.",
        status_code: 404,
      });
    });
  });
});
