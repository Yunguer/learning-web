import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "models/user.js";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous User", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistent_username",
        {
          method: "PATCH",
        },
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

    test("With duplicated 'username'", async () => {
      const firstUsernameResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "first_username",
            email: "first_email@example.com",
            password: "password123",
          }),
        },
      );

      expect(firstUsernameResponse.status).toBe(201);

      const secondUsernameResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "second_username",
            email: "second_email@example.com",
            password: "password123",
          }),
        },
      );

      expect(secondUsernameResponse.status).toBe(201);

      const patchUsernameResponse = await fetch(
        "http://localhost:3000/api/v1/users/second_username",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "first_username",
          }),
        },
      );

      expect(patchUsernameResponse.status).toBe(400);

      const patchUsernameResponseBody = await patchUsernameResponse.json();

      expect(patchUsernameResponseBody).toEqual({
        name: "ValidationError",
        message: "Username já cadastrado.",
        action: "Utilize outro username para realizar está operação.",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      const firstUsernameResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "1username_duplicated_email",
            email: "first_duplicated_email@example.com",
            password: "password123",
          }),
        },
      );

      expect(firstUsernameResponse.status).toBe(201);

      const secondUsernameResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "2username_duplicated_email",
            email: "second_duplicated_email@example.com",
            password: "password123",
          }),
        },
      );

      expect(secondUsernameResponse.status).toBe(201);

      const patchUsernameResponse = await fetch(
        "http://localhost:3000/api/v1/users/1username_duplicated_email",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "second_duplicated_email@example.com",
          }),
        },
      );

      expect(patchUsernameResponse.status).toBe(400);

      const patchUsernameResponseBody = await patchUsernameResponse.json();

      expect(patchUsernameResponseBody).toEqual({
        name: "ValidationError",
        message: "Email já cadastrado.",
        action: "Utilize outro email para realizar está operação.",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const createUserResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUsername",
            email: "unique@example.com",
            password: "password123",
          }),
        },
      );

      expect(createUserResponse.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUsername",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "secondUniqueUsername",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "secondUniqueUsername",
        email: "unique@example.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const createUserResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueEmail",
            email: "unique_email@example.com",
            password: "password123",
          }),
        },
      );

      expect(createUserResponse.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueEmail",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "secondUniqueEmail@example.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueEmail",
        email: "secondUniqueEmail@example.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const createUserResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "new_password_user",
            email: "new_password_email@example.com",
            password: "password123",
          }),
        },
      );

      expect(createUserResponse.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/new_password_user",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "new_password123",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "new_password_user",
        email: "new_password_email@example.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findByUsername("new_password_user");
      const correctPasswordMatch = await password.compare(
        "new_password123",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "password123",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
