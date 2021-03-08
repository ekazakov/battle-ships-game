const { getUserById } = require("../server/user-store");
const { getUserIdFromCookie } = require("./cookie");

exports.authCheck = function authCheck(request) {
  if (!request.cookies.auth) {
    return { code: 400, error: new Error("User not authorized") };
  }

  const userId = getUserIdFromCookie(request.cookies.auth);

  if (!getUserById(userId)) {
    return { code: 400, error: new Error("User doesn't exist") };
  }

  return { code: 204 };
};
