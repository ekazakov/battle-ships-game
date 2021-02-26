const { isUserWithNameExists } = require("./user-store");

function checkLogin(schema, data) {
  // console.log("schema", schema);
  // console.log("data", data);
  // console.log("parentSchema", parentSchema);
  // console.log("dataCtx", dataCtx);
  if (isUserWithNameExists(data)) {
    checkLogin.errors = [
      {
        message: "User with such login already exists"
      }
    ];
    return false;
  }

  return true;
}

function checkUser(schema, data) {
  if (isUserWithNameExists(data)) {
    return true;
  }

  checkUser.errors = [
    {
      message: "User with such login doesn't exist"
    }
  ];

  return false;
}

const uniqueLogin = (ajv) => {
  ajv.addKeyword("uniqueLogin", {
    keyword: "uniqueLogin",
    validate: checkLogin
  });

  ajv.addKeyword("userExists", {
    keyword: "userExists",
    validate: checkUser
  });
};

module.exports = uniqueLogin;
