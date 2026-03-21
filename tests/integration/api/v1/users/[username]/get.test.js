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
      const firstResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "case_match_username",
          email: "case_match_email@example.com",
          password: "password123",
        }),
      });

      expect(firstResponse.status).toBe(201);

      const secondResponse = await fetch(
        "http://localhost:3000/api/v1/users/case_match_username",
      );

      expect(secondResponse.status).toBe(200);

      const secondResponseBody = await secondResponse.json();

      expect(secondResponseBody).toEqual({
        id: secondResponseBody.id,
        username: "case_match_username",
        email: "case_match_email@example.com",
        password: secondResponseBody.password,
        created_at: secondResponseBody.created_at,
        updated_at: secondResponseBody.updated_at,
      });

      expect(uuidVersion(secondResponseBody.id)).toBe(4);
      expect(Date.parse(secondResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(secondResponseBody.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      const firstResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "Case_Mismatch_Username",
          email: "case_mismatch_email@example.com",
          password: "password123",
        }),
      });

      expect(firstResponse.status).toBe(201);

      const secondResponse = await fetch(
        "http://localhost:3000/api/v1/users/CASE_MISMATCH_USERNAME",
      );

      expect(secondResponse.status).toBe(200);

      const secondResponseBody = await secondResponse.json();

      expect(secondResponseBody).toEqual({
        id: secondResponseBody.id,
        username: "Case_Mismatch_Username",
        email: "case_mismatch_email@example.com",
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
