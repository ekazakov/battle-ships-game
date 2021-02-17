const STATE = Symbol("state");
const CURRENT_STATE_NAME = Symbol("current-state-name");
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
  machine[CURRENT_STATE_NAME] = description[STARTING_STATE];
  return machine;
};

exports.transitionTo = function transitionTo(stateName, fn) {
  return function (...args) {
    const result = fn.apply(this, args);
    this[STATE] = this[STATES][stateName];
    this[CURRENT_STATE_NAME] = stateName;
    return result;
  };
};

exports.getState = function getState(machine) {
  return machine[CURRENT_STATE_NAME];
};

exports.STATES = STATES;

exports.STARTING_STATE = STARTING_STATE;
