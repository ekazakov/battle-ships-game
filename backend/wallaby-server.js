module.exports = function () {
  return {
    files: ["src/**/*.js", "!/**/*.spec.js"],

    tests: ["src/**/*.spec.js"],
    testFramework: {
      type: "jest"
    },
    env: {
      type: "node",
      runner: "node" // or full path to any node executable
    }
  };
};
