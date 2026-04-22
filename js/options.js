export const defaultSettings = {
  boxbg: { value: false, type: "checkbox" },
  compact: { value: false, type: "checkbox" },
  itemsPerColumn: { value: 7, type: "number" },
  background: { value: "oklch(0.1 0 0)", type: "text" },
  showIcons: { value: true, type: "checkbox" },
  bookmarkFolder: { value: "tabbi", type: "text" },
};

const initializeOptions = () => {
  const elements = Object.fromEntries(
    Object.keys(defaultSettings).map((key) => [
      key,
      document.getElementById(key),
    ]),
  );
  elements.reset = document.getElementById("reset");
  return elements;
};

const getOptionValue = (element, type) => {
  if (!element) return null;
  return type === "checkbox" ? element.checked : element.value;
};

const setOptionValue = (element, type, value) => {
  if (!element) return;
  element[type === "checkbox" ? "checked" : "value"] = value;
};

const saveOptions = (elements) => {
  const options = Object.fromEntries(
    Object.entries(defaultSettings).map(([key, { type }]) => {
      const val = getOptionValue(elements[key], type);
      return [key, type === "number" ? parseInt(val, 10) : val];
    }),
  );

  chrome.storage.sync.set(options);
};

const loadOptions = (elements) => {
  chrome.storage.sync.get(Object.keys(defaultSettings), (savedData) => {
    Object.entries(defaultSettings).forEach(([key, { value, type }]) => {
      setOptionValue(elements[key], type, savedData[key] ?? value);
    });
  });
};

const resetOptions = (elements) => {
  const defaultValues = Object.fromEntries(
    Object.entries(defaultSettings).map(([key, { value }]) => [key, value]),
  );

  Object.entries(defaultSettings).forEach(([key, { value, type }]) => {
    setOptionValue(elements[key], type, value);
  });

  chrome.storage.sync.set(defaultValues);
};

document.addEventListener("DOMContentLoaded", () => {
  const elements = initializeOptions();

  loadOptions(elements);

  Object.entries(defaultSettings).forEach(([key, { type }]) => {
    const eventType = type === "checkbox" ? "change" : "input";
    elements[key]?.addEventListener(eventType, () => saveOptions(elements));
  });

  elements.reset?.addEventListener("click", () => resetOptions(elements));
});
