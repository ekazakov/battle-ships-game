export function buildAuthCookie(id) {
  return `auth=${encodeURIComponent(`auth-token#${id}`)}`;
}

export function parseAuthCookie(cookieHeader) {
  const [name, cookieValue] = cookieHeader.split("=");
  const [value] = cookieValue.split(";");
  const [prefix, id] = decodeURIComponent(value).split("#");

  return {
    name,
    prefix,
    id
  };
}

export function getUserIdFromCookie(cookie) {
  const [, id] = cookie.split("#");
  return id;
}
