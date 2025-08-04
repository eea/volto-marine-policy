import { Pluggable, Plug } from '@plone/volto/components/manage/Pluggable';
import { getBaseUrl, flattenToAppURL } from '@plone/volto/helpers';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';
// import { getWorkflowProgress } from '@eeacms/volto-workflow-progress/actions';
import '@eeacms/volto-workflow-progress/less/editor.less';


/**
 * getGeonames function.
 * @function getGeonames
 * @param {url} url URL.
 * @returns {Object} Object.
 */
export function getWorkflowProgress(item) {
  return {
    type: 'WORKFLOW_PROGRESS_PATH',
    item,
    request: {
      op: 'get',
      path: `${item}/@workflow.progress`,
      headers: {
        Accept: 'application/json',
      },
    },
  };
}

const itemTracker = (tracker, currentStateKey, currentState) => {
  const tracker_key_array = tracker[0];
  const is_active = tracker_key_array.indexOf(currentStateKey) > -1;

  return (
    <li
      key={`progress__item ${tracker_key_array}`}
      className={`progress__item ${
        is_active
          ? 'progress__item--active'
          : tracker[1] < currentState.done
          ? 'progress__item--completed'
          : 'progress__item--next'
      }`}
    >
      {tracker[2].map((title, index) => (
        <div
          key={`progress__title ${tracker_key_array}${index}`}
          className={`progress__title ${
            currentState.title !== title ? 'title-incomplete' : ''
          }`}
        >
          {title}
          {is_active && <div name="active-workflow-progress" />}
        </div>
      ))}
    </li>
  );
};

/**
 * @summary The React component that shows progress tracking of selected content.
 */
const ProgressWorkflow = (props) => {
  const { content, pathname, token } = props;
  const isAuth = !!token;
  const currentStateKey = content?.review_state;
  const dispatch = useDispatch();
  const contentId = content?.['@id'];
  const basePathname = getBaseUrl(pathname);
  const contentContainsPathname =
    contentId &&
    basePathname &&
    flattenToAppURL(contentId).endsWith(basePathname);
  const fetchCondition =
    pathname.endsWith('/contents') ||
    pathname.endsWith('/edit') ||
    pathname === basePathname;
  // console.log(basePathname);
  const [workflowProgressSteps, setWorkflowProgressSteps] = useState([]);
  const [currentState, setCurrentState] = useState(null);
  const workflowProgressPath = useSelector((state) => {
    // console.log(state?.workflowProgressPath);
    if (state?.workflowProgressPath?.[basePathname]?.get?.loaded === true) {
      const progress = state?.workflowProgressPath?.[basePathname]?.result;
      // debugger;
      // console.log(flattenToAppURL(progress['@id']), "===", basePathname + '/@workflow.progress');
      if (
        progress &&
        flattenToAppURL(progress['@id']).endsWith(
          basePathname + '/@workflow.progress',
        )
      ) {
        return state?.workflowProgressPath?.[basePathname];
      }
    }
    return null;
  });
  const pusherRef = useRef(null);

  // set visible by clicking oustisde
  const hideVisibleSide = () => {
    pusherRef.current &&
      pusherRef.current.lastElementChild.classList.add('is-hidden');
  };
  // toggle visible by clicking on the button
  const toggleVisibleSide = () => {
    pusherRef.current &&
      pusherRef.current.lastElementChild.classList.toggle('is-hidden');
  };

  // apply all computing when the workflowProgress results come from the api
  useEffect(() => {
    const findCurrentState = (steps, done) => {
      const arrayContainingCurrentState = steps.find(
        (itemElements) => itemElements[1] === done,
      );
      const indexOfCurrentStateKey =
        arrayContainingCurrentState[0].indexOf(currentStateKey);
      const title = arrayContainingCurrentState[2][indexOfCurrentStateKey];
      const description =
        arrayContainingCurrentState[3][indexOfCurrentStateKey];

      setCurrentState({
        done,
        title,
        description,
      });
    };

    /**
     * remove states that are 0% unless if it is current state
     * @param {Object[]} states - array of arrays
     * @param {Object[]} states[0][0] - array of state keys (ex: [private, published])
     * @param {number} states[0][1] - percent
     * @param {Object[]} states[0][2] - array of state titles (ex: [Private, Published])
     * @param {Object[]} states[0][3] - array of state descriptions
     * @returns {Object[]} result - array of arrays, same structure but filtered
     */
    const filterOutZeroStatesNotCurrent = (states) => {
      const [firstState, ...rest] = states;

      const result =
        firstState[1] > 0 // there aren't any 0% states
          ? states // return all states
          : (() => {
              // there are 0% states
              const indexOfCurrentStateKey =
                firstState[0].indexOf(currentStateKey);
              if (indexOfCurrentStateKey > -1) {
                const keys = [firstState[0][indexOfCurrentStateKey]];
                const titles = [firstState[2][indexOfCurrentStateKey]];
                const description = [firstState[3][indexOfCurrentStateKey]];

                return [[keys, 0, titles, description], ...rest]; // return only the current 0% state and test
              }
              return rest; // if current state in not a 0% return all rest
            })();

      return result;
    };

    // filter out paths that don't have workflow (home, login, dexterity even if the content obj stays the same etc)
    if (
      contentId &&
      contentContainsPathname &&
      basePathname &&
      basePathname !== '/' && // wihout this there will be a flicker for going back to home ('/' is included in all api paths)
      workflowProgressPath?.result?.steps &&
      workflowProgressPath.result.steps.length > 0 &&
      !workflowProgressPath.get?.error &&
      Array.isArray(workflowProgressPath?.result?.steps)
    ) {
      findCurrentState(
        workflowProgressPath.result.steps,
        workflowProgressPath.result.done,
      );
      setWorkflowProgressSteps(
        filterOutZeroStatesNotCurrent(workflowProgressPath.result.steps).reverse(),
      );
    } else {
      if (currentState) {
        setCurrentState(null); // reset current state only if a path without workflow is
        // chosen to avoid flicker for those that have workflow
      }
    }
  }, [workflowProgressPath?.result, currentStateKey, pathname]); // eslint-disable-line

  // get progress again if path or content changes
  useEffect(() => {
    if (token && fetchCondition && contentContainsPathname) {
      dispatch(getWorkflowProgress(basePathname));
    } // the are paths that don't have workflow (home, login etc) only if logged in
  }, [
    dispatch,
    pathname,
    basePathname,
    token,
    currentStateKey,
    contentContainsPathname,
    fetchCondition,
  ]);

  // on mount subscribe to mousedown to be able to close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const parentDiv = pusherRef.current;
      if (parentDiv) {
        if (
          !doesNodeContainClick(parentDiv, e) &&
          !parentDiv.lastElementChild.classList.contains('is-hidden')
        ) {
          hideVisibleSide();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside, false);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentStateClass = {
    published: 'published',
    private: 'private',
  };
  console.log(basePathname, currentState?.done);
  // debugger;
  return isAuth && currentState && contentContainsPathname ? (
    // <Plug pluggable="main.toolbar.top"  order={0}>
      <div className="toolbar-workflow-progress" >
        <div ref={pusherRef}>
          <button
            className={`circle-right-btn ${
              currentStateClass[currentStateKey]
                ? `review-state-${currentStateKey}`
                : currentState.done === 100
                ? 'review-state-published'
                : ''
            }`}
            id="toolbar-cut-blocks"
            onClick={toggleVisibleSide}
            title="Editing progress"
          >
            {`${currentState.done}%`}
          </button>
          <div className={`sidenav-ol sidenav-ol--wp is-hidden`}>
            <ol
              className="progress-reversed"
              style={{
                counterReset: `item ${workflowProgressSteps.length + 1}`,
              }}
            >
              {workflowProgressSteps.map((progressItem) =>
                itemTracker(progressItem, currentStateKey, currentState),
              )}
            </ol>
          </div>
        </div>
        <div
          className={`review-state-text ${
            currentStateClass[currentStateKey]
              ? `review-state-${currentStateKey}`
              : currentState.done === 100
              ? 'review-state-published'
              : ''
          }`}
        >
          {currentState.title}
        </div>
      </div>
    // </Plug>
  ) : (
    ''
  );
};

ProgressWorkflow.propTypes = {
  pathname: PropTypes.string.isRequired,
  content: PropTypes.object,
};

export default ProgressWorkflow;
