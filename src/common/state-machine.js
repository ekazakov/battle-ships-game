const STATE = Symbol("state");
const CURRENT_STATE_NAME = Symbol("current-state-name");
const STATES = Symbol("states");
const STARTING_STATE = Symbol("starting-state");
const ON_STATE_TRANSITION = Symbol("on-state-transition");
const RESERVED = [STATES, STARTING_STATE];

exports.StateMachine = function StateMachine(description) {
  const machine = {
    [ON_STATE_TRANSITION]() {
      if (typeof this.onStateTransition === "function") {
        this.onStateTransition();
      }
    }
  };

  const propsAndMethods = Object.keys(description).filter(
    (prop) => !RESERVED.includes(prop)
  );

  for (const prop of propsAndMethods) {
    machine[prop] = description[prop];
  }

  machine[STATES] = description[STATES];

  const eventNames = Object.entries(description[STATES]).reduce(
    (names, [, stateDescription]) => {
      const eventNamesForState = Object.keys(stateDescription);

      for (const eventName of eventNamesForState) {
        names.add(eventName);
      }

      return names;
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
          `event: ${eventName} is not supported in state: ${machine[CURRENT_STATE_NAME]}`
        );
      }
    };
  }

  machine[STATE] = description[STATES][description[STARTING_STATE]];
  machine[CURRENT_STATE_NAME] = description[STARTING_STATE];
  return machine;
};

exports.transitionTo = function transitionTo(...params) {
  if (params.length === 2) {
    const [stateName, fn] = params;
    return function transition(...args) {
      fn.apply(this, args);
      this[STATE] = this[STATES][stateName];
      this[CURRENT_STATE_NAME] = stateName;
      this[ON_STATE_TRANSITION]();
    };
  }

  if (params.length === 1 && typeof params[0] === "function") {
    const [fn] = params;
    return function transition(...args) {
      const nextState = fn.apply(this, args);
      this[STATE] = this[STATES][nextState];
      this[CURRENT_STATE_NAME] = nextState;
      this[ON_STATE_TRANSITION]();
    };
  }

  throw new Error("Unsupported arguments");
};

exports.getState = function getState(machine) {
  return machine[CURRENT_STATE_NAME];
};

exports.STATES = STATES;

exports.STARTING_STATE = STARTING_STATE;
