module.exports = function () {
  return {
    files: ["src/server/**/*.js", "src/common/**/*.js", "!/**/*.spec.js"],

    tests: ["src/server/**/*.spec.js"],
    testFramework: {
      type: "jest"
    },
    env: {
      type: "node",
      runner: "node" // or full path to any node executable
    }
  };
};
