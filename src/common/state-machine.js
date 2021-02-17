const STATE = Symbol("state");
const STATES = Symbol("states");
const STARTING_STATE = Symbol("starting-state");

const RESERVED = [STATES, STARTING_STATE];

exports.StateMachine = function StateMachine(description) {
  const machine = {};

  const propsAndMethods = Object.keys(description).filter(
    (prop) => !RESERVED.includes(prop)
  );

  for (const prop of propsAndMethods) {
    machine[prop] = description[prop];
  }

  machine[STATES] = description[STATES];

  const eventNames = Object.entries(description[STATES]).reduce(
    (eventNames, [state, stateDescription]) => {
      const eventNamesForState = Object.keys(stateDescription);

      for (const eventName of eventNamesForState) {
        eventNames.add(eventName);
      }

      return eventNames;
    },
    new Set()
  );

  for (const eventName of eventNames) {
    machine[eventName] = function (...args) {
      const handler = this[STATE][eventName];

      if (typeof handler === "function") {
        handler.apply(this, args);
      } else {
        throw new Error(
          `event: ${eventName} is not supported in state: ${STATE}`
        );
      }
    };
  }

  machine[STATE] = description[STATES][description[STARTING_STATE]];
};

exports.transitionTo = function transitionTo(stateName, fn) {
  return function (...args) {
    const result = fn.apply(this, args);
    this[STATE] = this[STATES][stateName];

    return result;
  };
};

exports.getState = function getState(machine) {
  return machine[STATE];
};

exports.STATES = STATES;

exports.STARTING_STATE = STARTING_STATE;
