module.exports = function () {
  return {
    files: ["src/**/*.ts", "!/**/*.spec.ts"],

    tests: ["src/**/*.spec.ts"],
    testFramework: {
      type: "jest"
    },
    env: {
      type: "node",
      runner: "node" // or full path to any node executable
    }
  };
};
