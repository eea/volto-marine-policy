/**
 * Data Figure reducer.
 * @module reducers/workflowProgress
 */

const initialState = {
  get: {
    loaded: false,
    loading: false,
    error: null,
  },
};

/**
 * Data figure reducer.
 * @function workflowProgress
 * @param {Object} state Current state.
 * @param {Object} action Action to be handled.
 * @returns {Object} New state.
 */
export default function workflowProgressPath(state = initialState, action = {}) {
  let { result } = action;
  switch (action.type) {
    case "WORKFLOW_PROGRESS_PATH_PENDING":
      return {
        // ...state,
        // get: {
        //   loading: true,
        //   loaded: false,
        //   error: null,
        // },

        ...state,
        [action.item]: {
          get: {
            loading: true,
            loaded: false,
            error: null,
          },
        },
      };
    case "WORKFLOW_PROGRESS_PATH_SUCCESS":
      return {
        // ...state,
        // get: {
        //   loading: false,
        //   loaded: true,
        //   error: null,
        // },
        // result,

        ...state,
        [action.item]: {
          get: {
            loading: false,
            loaded: true,
            error: null,
          },
          result,
        },
      };
    case "WORKFLOW_PROGRESS_PATH_FAIL":
      return {
        // ...state,
        // get: {
        //   loading: false,
        //   loaded: false,
        //   error: action.error,
        // },

        ...state,
        [action.item]: {
          get: {
            loading: false,
            loaded: false,
            error: action.error,
          },
        },
      };
    default:
      return state;
  }
}
