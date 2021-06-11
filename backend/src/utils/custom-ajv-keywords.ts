const { isUserWithNameExists } = require("../services/user");

async function checkLogin(schema, data) {
  // console.log("schema", schema);
  // console.log("data", data);
  // console.log("parentSchema", parentSchema);
  // console.log("dataCtx", dataCtx);
  if (await isUserWithNameExists(data)) {
    // @ts-ignore
    checkLogin.errors = [
      {
        message: "User with such login already exists"
      }
    ];
    return false;
  }

  return true;
}

async function checkUser(schema, data) {
  if (await isUserWithNameExists(data)) {
    return true;
  }

  // @ts-ignore
  checkUser.errors = [
    {
      message: "User with such login doesn't exist"
    }
  ];

  return false;
}

const uniqueLogin = (ajv) => {
  ajv.addKeyword("uniqueLogin", {
    async: true,
    keyword: "uniqueLogin",
    validate: checkLogin
  });

  ajv.addKeyword("userExists", {
    async: true,
    keyword: "userExists",
    validate: checkUser
  });
};

export default uniqueLogin;
