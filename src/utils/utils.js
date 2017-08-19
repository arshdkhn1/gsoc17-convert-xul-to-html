/* exported underlineAccessKey
 */
(function() {
  // some utils function that can be used across all react components
  window.underlineAccessKey = (str, key) => {
    if (key === null) {
      return str;
    } else if (key.length > 1) {
      return str;
    } else {
      const index = str.toLowerCase().indexOf(key.toLowerCase());
      if (index === -1) {
        if (str.slice(0, -1) === ":") {
          return `${str.slice(0, -1)} (<u>${key.toUpperCase()}</u>)${str.slice(-1)}`;
        } else {
          return `${str} (<u>${key.toUpperCase()}</u>)`;
        }
      } else {
        return str.slice(0, index) + "<u>" + str[index] + "</u>" + str.slice(index + 1);
      }
    }
  };
})();
