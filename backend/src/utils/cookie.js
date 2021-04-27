exports.buildAuthCookie = function buildAuthCookie(id) {
  return `auth=${encodeURIComponent(`auth-token#${id}`)}`;
};

exports.parseAuthCookie = function parseAuthCookie(cookieHeader) {
  const [name, cookieValue] = cookieHeader.split("=");
  const [value] = cookieValue.split(";");
  const [prefix, id] = decodeURIComponent(value).split("#");

  return {
    name,
    prefix,
    id
  };
};

exports.getUserIdFromCookie = function getUserIdFromCookie(cookie) {
  const [, id] = cookie.split("#");
  return id;
};
