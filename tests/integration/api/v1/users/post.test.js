import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "models/user.js";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous User", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "yunguer",
          email: "yunguer@example.com",
          password: "password123",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "yunguer",
        email: "yunguer@example.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findByUsername("yunguer");
      const correctPasswordMatch = await password.compare(
        "password123",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "wrong_password",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicated 'email'", async () => {
      const firstResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "first_username",
          email: "duplicated_email@example.com",
          password: "password123",
        }),
      });

      expect(firstResponse.status).toBe(201);

      const secondResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "second_username",
          email: "Duplicated_Email@example.com",
          password: "password123",
        }),
      });

      expect(secondResponse.status).toBe(400);

      const secondResponseBody = await secondResponse.json();

      expect(secondResponseBody).toEqual({
        name: "ValidationError",
        message: "Email já cadastrado.",
        action: "Utilize outro email para realizar está operação.",
        status_code: 400,
      });
    });

    test("With duplicated 'username'", async () => {
      const firstResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicated_username",
          email: "first_email@example.com",
          password: "password123",
        }),
      });

      expect(firstResponse.status).toBe(201);

      const secondResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "Duplicated_Username",
          email: "second_email@example.com",
          password: "password123",
        }),
      });

      expect(secondResponse.status).toBe(400);

      const secondResponseBody = await secondResponse.json();

      expect(secondResponseBody).toEqual({
        name: "ValidationError",
        message: "Username já cadastrado.",
        action: "Utilize outro username para realizar está operação.",
        status_code: 400,
      });
    });
  });
});
