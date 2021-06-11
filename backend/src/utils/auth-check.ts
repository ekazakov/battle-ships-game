import { getUserIdFromCookie } from "./cookie";

const { getUserById } = require("../services/user");

export async function authCheck(request) {
  try {
    if (!request.cookies.auth) {
      return { code: 400, error: new Error("User not authorized") };
    }

    const userId = getUserIdFromCookie(request.cookies.auth);
    const user = await getUserById(userId);
    if (!user) {
      return { code: 400, error: new Error("User doesn't exist") };
    }
    return { code: 200, user };
  } catch (error) {
    return { code: 400, error };
  }
}
