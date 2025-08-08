import config from '@plone/volto/registry';
import { getBaseUrl, flattenToAppURL } from '@plone/volto/helpers';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import Select from 'react-select';
import { toast } from 'react-toastify';
import last from 'lodash/last';
import split from 'lodash/split';
import uniqBy from 'lodash/uniqBy';
import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';
import Toast from '@plone/volto/components/manage/Toast/Toast';
// import {
//   getWorkflowOptions,
//   getCurrentStateMapping,
// } from '@plone/volto/helpers/Workflows/Workflows';
import { transitionWorkflow } from '@plone/volto/actions/workflow/workflow';
import '@eeacms/volto-workflow-progress/less/editor.less';

const currentStateClass = {
  draft: 'draft',
  submitted: 'submitted',
  approved: 'approved',
  published: 'published',
  private: 'private',
};

const selectTheme = (theme) => ({
  ...theme,
  borderRadius: 0,
  colors: {
    ...theme.colors,
    primary25: 'hotpink',
    primary: '#b8c6c8',
  },
});

const messages = defineMessages({
  messageUpdated: {
    id: 'Workflow updated.',
    defaultMessage: 'Workflow updated.',
  },
  messageNoWorkflow: {
    id: 'No workflow',
    defaultMessage: 'No workflow',
  },
  state: {
    id: 'State',
    defaultMessage: 'State',
  },
});

const getWorkflowOptions = (transition) => {
  const mapping = config.settings.workflowMapping;
  const key = last(split(transition['@id'], '/'));

  if (key in mapping) {
    return {
      new_state_id: transition.new_state_id,
      label: transition.title,
      ...mapping[key],
      url: transition['@id'],
    };
  }

  // Return an option with a neutral color
  return {
    new_state_id: transition.new_state_id,
    value: key,
    label: transition.title,
    color: '#000',
    url: transition['@id'],
  };
};

const customSelectStyles = {
  control: (styles, state) => ({
    ...styles,
    // border: 'none',
    border: '1px solid #b8c6c8',
    borderRadius: '0.25rem',
    borderBottom: '1px solid #b8c6c8',
    boxShadow: 'none',
    borderBottomStyle: state.menuIsOpen ? 'dotted' : 'solid',
  }),
  menu: (styles, state) => ({
    ...styles,
    top: null,
    marginTop: 0,
    boxShadow: 'none',
    borderBottom: '2px solid #b8c6c8',
  }),
  indicatorSeparator: (styles) => ({
    ...styles,
    width: null,
  }),
  valueContainer: (styles) => ({
    ...styles,
    padding: 0,
  }),
  option: (styles, state) => ({
    ...styles,
    backgroundColor: null,
    minHeight: '50px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5em 0.8em',
    color: state.isSelected
      ? '#007bc1'
      : state.isFocused
      ? '#4a4a4a'
      : 'inherit',
    ':active': {
      backgroundColor: null,
    },
    span: {
      flex: '0 0 auto',
    },
    svg: {
      flex: '0 0 auto',
    },
  }),
};

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
      path: `${item}/@workflow.progress.nis`,
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
  // const Select = props.reactSelect.default;
  const intl = useIntl();
  const isAuth = !!token;
  // const currentStateKey = content?.review_state;
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
  const [currentStateKey, setCurrentStateKey] = useState(content?.review_state);

  const transition = (selectedOption) => {
    // console.log('selectedOption: ', selectedOption);
    dispatch(transitionWorkflow(flattenToAppURL(selectedOption.url))).then(
      () => {
        toast.success(
          <Toast
            success
            title={intl.formatMessage(messages.messageUpdated)}
            content=""
          />,
        );
        setCurrentStateKey(selectedOption.new_state_id);
      },
    );
  };

  const workflowProgressPath = useSelector((state) => {
    if (state?.workflowProgressPath?.[basePathname]?.get?.loaded === true) {
      const progress = state?.workflowProgressPath?.[basePathname]?.result;
      if (
        progress &&
        flattenToAppURL(progress['@id']).endsWith(
          basePathname + '/@workflow.progress.nis',
        )
      ) {
        return state?.workflowProgressPath?.[basePathname];
      }
    }
    return null;
  });
  const pusherRef = useRef(null);
  const transitions = workflowProgressPath?.result?.transitions || [];

  // set visible by clicking oustisde
  const hideVisibleSide = () => {
    pusherRef.current &&
      pusherRef.current.lastElementChild.classList.add('is-hidden');
  };
  // toggle visible by clicking on the button
  const toggleVisibleSide = (event) => {
    // pusherRef.current &&
    //   pusherRef.current.lastElementChild.classList.toggle('is-hidden');
    const button = event.currentTarget;
    const dropdown = pusherRef.current?.lastElementChild;

    if (!dropdown) return;

    const rect = button.getBoundingClientRect();

    dropdown.style.position = 'fixed';
    dropdown.style.top = `${rect.bottom}px`; // or rect.top
    dropdown.style.left = `${rect.left}px`;
    dropdown.classList.toggle('is-hidden');
    // console.log(rect.bottom, rect.left);
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
      return states; // do not filter
      // const [firstState, ...rest] = states;
      // const result =
      //   firstState[1] > 0 // there aren't any 0% states
      //     ? states // return all states
      //     : (() => {
      //         // there are 0% states
      //         const indexOfCurrentStateKey =
      //           firstState[0].indexOf(currentStateKey);
      //         if (indexOfCurrentStateKey > -1) {
      //           const keys = [firstState[0][indexOfCurrentStateKey]];
      //           const titles = [firstState[2][indexOfCurrentStateKey]];
      //           const description = [firstState[3][indexOfCurrentStateKey]];

      //           return [[keys, 0, titles, description], ...rest]; // return only the current 0% state and test
      //         }
      //         return rest; // if current state in not a 0% return all rest
      //       })();

      // return result;
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
        filterOutZeroStatesNotCurrent(
          workflowProgressPath.result.steps,
        ).reverse(),
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

  // console.log('currentState: ', currentState);
  // console.log('currentStateKey:', currentStateKey);
  // console.log(workflowProgressPath?.result?.transitions);
  return isAuth && currentState && contentContainsPathname ? (
    <>
      <div className="toolbar-workflow-progress">
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
            <div className="workflow-select">
              <Select
                // menuIsOpen={true}
                name="state-select"
                className="react-select-container"
                classNamePrefix="react-select"
                isDisabled={!content.review_state || transitions.length === 0}
                options={uniqBy(
                  transitions.map((transition) =>
                    getWorkflowOptions(transition),
                  ),
                  'label',
                ).concat({ value: currentStateKey, label: currentState.title })}
                styles={customSelectStyles}
                theme={selectTheme}
                // components={{
                //   DropdownIndicator,
                //   Placeholder,
                //   Option,
                //   SingleValue,
                // }}
                onChange={transition}
                value={{ value: currentStateKey, label: currentState.title }}
                isSearchable={false}
              />
            </div>
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
          id="toolbar-cut-blocks"
          onClick={toggleVisibleSide}
          onKeyDown={() => {}}
          title="Editing progress"
          role="presentation"
        >
          {`${currentState.title}`}
        </div>
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
    </>
  ) : (
    // </Plug>
    ''
  );
};

ProgressWorkflow.propTypes = {
  pathname: PropTypes.string.isRequired,
  content: PropTypes.object,
};

export default ProgressWorkflow;
