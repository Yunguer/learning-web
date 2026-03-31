import user from "models/user.js";
import password from "models/password.js";
import { NotFoundError, UnathourizedError } from "infra/errors.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnathourizedError) {
      throw new UnathourizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique os dados e tente novamente.",
      });
    }

    throw error;
  }

  async function findUserByEmail(providedEmail) {
    let foundUser;

    try {
      foundUser = await user.findByEmail(providedEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnathourizedError({
          message: "Email incorreto.",
          action: "Verifique o email e tente novamente.",
        });
      }

      throw error;
    }

    return foundUser;
  }

  async function validatePassword(providedPassword, storedPassword) {
    const isPasswordCorrect = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!isPasswordCorrect) {
      throw new UnathourizedError({
        message: "Senha incorreta.",
        action: "Verifique a senha e tente novamente.",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
