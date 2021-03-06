/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
  // This tabpaanel componet has all the input,select and checkbox elements.
  // This component is fairly simple enough, so refactorization is not done.

  class CalendarPropertiesTabPanel extends React.Component {
    componentDidMount() {
      this.applyComponentChanges(this.props.activeTabData);
    }

    componentWillReceiveProps(nextProps) {
      // This ensures that applyComponentChanges is called only once when data from iframe is sent.

      // NOTE: message event is being sent by an interval on every 100ms so there is possibility
      // that two message event are accepted so to avoid extra rerendering we are checking
      // source value. Before recieving message event , source is undefined but after receiving
      // message event, source is "dialog-message".

      if (this.props.source !== nextProps.source) {
        this.applyComponentChanges(nextProps.activeTabData);
      }
    }

    applyComponentChanges(props) {
      // calling blur first so that focus is decided by new state but not old default state
      this.calendarNameInput.blur();

      const { forceDisabled, disabled } = props;
      // https://dxr.mozilla.org/comm-central/source/calendar/base/content/dialogs/calendar-properties-dialog.js#53
      if (forceDisabled) {
        this.calendarEnablerCheckbox.disabled = true;
      }
      if (!disabled) {
        this.calendarNameInput.focus();
      }
    }

    getSelectOptions(arr) {
      arr = arr ? arr : ["NONE"];
      const options = arr.map((e, i) =>
        React.createElement("option", { value: e.key, key: i }, e.name)
      );
      return options;
    }

    calendarToggleChange(event) {
      const { changeState, activeTabData } = this.props;
      const tabState = Object.assign({}, activeTabData, { disabled: !activeTabData.disabled });
      changeState(tabState);
    }

    calendarNameChange(event) {
      const { changeState, activeTabData } = this.props;
      const tabState = Object.assign({}, activeTabData, { name: event.target.value });
      changeState(tabState);
    }

    calendarColorChange(event) {
      const { changeState, activeTabData } = this.props;
      const tabState = Object.assign({}, activeTabData, { color: event.target.value });
      changeState(tabState);
    }

    // calendarUriChange(event) {
    //   const { changeState, activeTabData } = this.props;
    //   changeState(activeTabData);
    // }

    calendarEmailChange(event) {
      const { changeState, activeTabData } = this.props;
      let newImipState = JSON.stringify(activeTabData.imip);
      newImipState = JSON.parse(newImipState);
      newImipState.identity.selected = event.target.value;
      const tabState = Object.assign({}, activeTabData, { imip: newImipState });
      changeState(tabState);
    }

    readOnlyChange(event) {
      const { changeState, activeTabData } = this.props;
      const tabState = Object.assign({}, activeTabData, { readOnly: !activeTabData.readOnly });
      changeState(tabState);
    }

    suppressAlarmsChange(event) {
      const { changeState, activeTabData } = this.props;
      const tabState = Object.assign({}, activeTabData, {
        supressAlarms: !activeTabData.supressAlarms
      });
      changeState(tabState);
    }

    cacheOptionsChange(event) {
      const { changeState, activeTabData } = this.props;
      const newCacheData = Object.assign({}, activeTabData.cache, {
        enabled: !activeTabData.cache.enabled
      });
      const tabState = Object.assign({}, activeTabData, { cache: newCacheData });
      changeState(tabState);
    }

    refreshIntervalChange(event) {
      const { changeState, activeTabData } = this.props;
      const value = event.target.value;
      const tabState = Object.assign({}, activeTabData, {
        refreshInterval: value === "Manually" ? value : parseInt(value, 10)
      });
      changeState(tabState);
    }

    getRefreshIntervalValues() {
      return [1, 5, 15, 30, 60, "Manually"].map(e => ({ name: e, key: e }));
    }

    render() {
      const {
        forceDisabled,
        disabled,
        name,
        color,
        uri,
        readOnly,
        supressAlarms,
        identities,
        imip,
        cache,
        capabilities,
        canRefresh,
        refreshInterval
      } = this.props.activeTabData;

      // Set up the cache field
      const canCache = cache.supported !== false;
      const alwaysCache = cache.always;
      let cacheDisabled = false;
      let showCacheBox = true;
      let cacheBoxChecked;

      if (!canCache || alwaysCache) {
        // doesn't seem like there is any need to set this attribute
        // since cachebox will not present in DOM
        // cacheBox.setAttribute("disable-capability", "true");
        showCacheBox = false;
        cacheDisabled = true;
      }

      cacheBoxChecked = alwaysCache || (canCache && cache.enabled);

      // Set up the show alarms row and checkbox
      const showSuppressAlarmsRow = capabilities.alarms.popup.supported === true;

      // get options for email and refresh interval
      const emailOptions = this.getSelectOptions(identities);
      const refreshIntervalOptions = this.getSelectOptions(this.getRefreshIntervalValues());

      const selectedEmailKey = imip.identity.selected;
      const calendarToggleChange = this.calendarToggleChange.bind(this);
      const calendarNameChange = this.calendarNameChange.bind(this);
      const calendarEmailChange = this.calendarEmailChange.bind(this);
      const calendarColorChange = this.calendarColorChange.bind(this);
      const readOnlyChange = this.readOnlyChange.bind(this);
      const suppressAlarmsChange = this.suppressAlarmsChange.bind(this);
      const cacheOptionsChange = this.cacheOptionsChange.bind(this);
      const refreshIntervalChange = this.refreshIntervalChange.bind(this);

      return React.createElement(
        "div",
        { className: `tabpanel ${this.props.isSingleTab ? "single-tab" : ""}` },
        forceDisabled &&
          React.createElement(
            "p",
            { id: "force-disabled-description" },
            "The provider for this calendar could not be found. This often happens if you have disabled or uninstalled certain addons."
          ),
        React.createElement(
          "div",
          { id: "calendar-enabler-container" },
          React.createElement("input", {
            type: "checkbox",
            className: "checkbox",
            id: "calendar-enabled-checkbox",
            checked: !disabled,
            onChange: calendarToggleChange,
            ref: node => (this.calendarEnablerCheckbox = node)
          }),
          React.createElement(
            "label",
            {
              htmlFor: "calendar-enabled-checkbox",
              className: `${forceDisabled ? "disabled" : ""}`
            },
            "Switch this calendar on"
          )
        ),
        React.createElement(
          "div",
          { id: "calendar-properties-grid", className: disabled ? "grid disabled" : "grid" },
          React.createElement(
            "div",
            { id: "calendar-name-row", className: "row" },
            React.createElement(
              "label",
              { htmlFor: "calendar-name", className: `row-label ${disabled ? "disabled" : ""}` },
              "Calendar Name:"
            ),
            React.createElement("input", {
              type: "text",
              id: "calendar-name",
              className: "row-input",
              value: name,
              onChange: calendarNameChange,
              disabled: disabled,
              ref: node => (this.calendarNameInput = node)
            })
          ),
          React.createElement(
            "div",
            { id: "calendar-color-row", className: "row" },
            React.createElement(
              "label",
              { htmlFor: "calendar-color", className: `row-label ${disabled ? "disabled" : ""}` },
              "Color:"
            ),
            React.createElement("input", {
              type: "color",
              id: "calendar-color",
              className: "row-input",
              value: color,
              onChange: calendarColorChange,
              disabled: disabled
            })
          ),
          React.createElement(
            "div",
            { id: "calendar-uri-row", className: "row" },
            React.createElement(
              "label",
              { htmlFor: "calendar-uri", className: `row-label ${disabled ? "disabled" : ""}` },
              "Location:"
            ),
            React.createElement("input", {
              type: "text",
              id: "calendar-uri",
              className: "row-input",
              value: uri,
              disabled: disabled,
              readOnly: true
            })
          ),
          React.createElement(
            "div",
            { id: "calendar-email-identity-row", className: "row" },
            React.createElement(
              "label",
              {
                htmlFor: "email-identity-menulist",
                className: `row-label ${disabled ? "disabled" : ""}`
              },
              "E-Mail:"
            ),
            React.createElement(
              "select",
              {
                id: "email-identity-menulist",
                className: "row-input",
                disabled: disabled,
                onChange: calendarEmailChange,
                value: selectedEmailKey
              },
              emailOptions
            )
          ),
          canRefresh &&
            React.createElement(
              "div",
              { id: "calendar-refreshInterval-row", className: "row" },
              React.createElement(
                "label",
                {
                  htmlFor: "calendar-refreshInterval-menulist",
                  className: `row-label ${disabled ? "disabled" : ""}`
                },
                "Refresh Calendar:"
              ),
              React.createElement(
                "select",
                {
                  id: "calendar-refreshInterval-menulist",
                  className: "row-input",
                  disabled: disabled,
                  onChange: refreshIntervalChange,
                  value: refreshInterval
                },
                refreshIntervalOptions
              )
            ),
          React.createElement(
            "div",
            { id: "calendar-readOnly-row", className: "row" },
            React.createElement(
              "div",
              null,
              React.createElement("input", {
                type: "checkbox",
                className: "checkbox",
                id: "readOnly",
                checked: readOnly,
                onChange: readOnlyChange,
                disabled: disabled
              }),
              React.createElement(
                "label",
                { htmlFor: "readOnly", className: `${disabled ? "disabled" : ""}` },
                "Read Only"
              )
            )
          ),
          showSuppressAlarmsRow &&
            React.createElement(
              "div",
              { id: "calendar-suppressAlarms-row", className: "row" },
              React.createElement(
                "div",
                null,
                React.createElement("input", {
                  type: "checkbox",
                  className: "checkbox",
                  id: "fire-alarms",
                  checked: supressAlarms,
                  onChange: suppressAlarmsChange,
                  disabled: disabled
                }),
                React.createElement(
                  "label",
                  {
                    htmlFor: "fire-alarms",
                    className: `row-label ${disabled ? "disabled" : ""}`
                  },
                  "Show Reminders"
                )
              )
            ),
          showCacheBox &&
            React.createElement(
              "div",
              { id: "calendar-cache-row", className: "row" },
              React.createElement(
                "div",
                null,
                React.createElement("input", {
                  type: "checkbox",
                  className: "checkbox",
                  id: "cache",
                  checked: cacheBoxChecked,
                  onChange: cacheOptionsChange,
                  disabled: cacheDisabled || disabled
                }),
                React.createElement(
                  "label",
                  {
                    htmlFor: "cache",
                    className: `row-label ${cacheDisabled || disabled ? "disabled" : ""}`
                  },
                  "Offline Support"
                )
              )
            )
        )
      );
    }
  }

  CalendarPropertiesTabPanel.propTypes = {
    activeTabData: PropTypes.object.isRequired,
    changeState: PropTypes.func.isRequired,
    isSingleTab: PropTypes.bool.isRequired,
    source: PropTypes.string
  };

  window.CalendarPropertiesTabPanel = CalendarPropertiesTabPanel;
})();
