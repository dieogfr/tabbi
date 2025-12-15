export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getSettings = (defaults) => {
  return new Promise((resolve) => {
    const keys = Object.keys(defaults).reduce((acc, key) => {
      acc[key] = defaults[key].value;
      return acc;
    }, {});

    chrome.storage.sync.get(keys, (items) => {
      resolve({ ...keys, ...items });
    });
  });
};
