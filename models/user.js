import database from "infra/database.js";
import { ValidationError, NotFoundError } from "infra/errors.js";
import password from "models/password.js";

async function create(userInputValues) {
  await validateUniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;
}

async function findByUsername(username) {
  const userFound = await runSelectQuery(username);
  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      LIMIT
        1
      ;`,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Username não encontrado.",
        action: "Verifique o username e tente novamente.",
      });
    }

    return results.rows[0];
  }
}

async function update(username, userInputValues) {
  const currentUser = await findByUsername(username);

  if (
    "username" in userInputValues &&
    userInputValues.username.toLowerCase() !==
      currentUser.username.toLowerCase()
  ) {
    await validateUniqueUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = {
    ...currentUser,
    ...userInputValues,
  };

  const updatedUser = await runUpdateQuery(userWithNewValues);
  return updatedUser;

  async function runUpdateQuery(userWithNewValues) {
    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          username = $2,
          email = $3,
          password = $4,
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
        ;`,
      values: [
        userWithNewValues.id,
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
      ],
    });

    return results.rows[0];
  }
}

async function validateUniqueUsername(username) {
  const results = await database.query({
    text: `
      SELECT
        username
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      lIMIT
        1
      ;`,
    values: [username],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "Username já cadastrado.",
      action: "Utilize outro username para realizar está operação.",
    });
  }
}

async function validateUniqueEmail(email) {
  const results = await database.query({
    text: `
      SELECT
        email
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
      LIMIT
        1 
      ;`,
    values: [email],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "Email já cadastrado.",
      action: "Utilize outro email para realizar está operação.",
    });
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

async function runInsertQuery(userInputValues) {
  const results = await database.query({
    text: `
        INSERT INTO
          users (username, email, password) 
        VALUES 
          ($1, $2, $3)
        RETURNING
          *
        ;`,
    values: [
      userInputValues.username,
      userInputValues.email,
      userInputValues.password,
    ],
  });

  return results.rows[0];
}

const user = {
  create,
  findByUsername,
  update,
};

export default user;
