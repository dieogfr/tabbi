export const defaultSettings = {
  boxbg: { value: false, type: "checkbox" },
  compact: { value: true, type: "checkbox" },
  itemsPerColumn: { value: 8, type: "number" },
  background: { value: "oklch(15% 0 0)", type: "text" },
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

const getOptionValue = (element, type) =>
  type === "checkbox" ? element.checked : element.value;

const setOptionValue = (element, type, value) => {
  if (!element) return;
  element[type === "checkbox" ? "checked" : "value"] = value;
};

const saveOptions = (elements) => {
  const options = Object.fromEntries(
    Object.entries(defaultSettings).map(([key, { type }]) => [
      key,
      type === "number"
        ? parseInt(getOptionValue(elements[key], type), 10)
        : getOptionValue(elements[key], type),
    ]),
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

  Object.keys(defaultSettings).forEach((key) => {
    elements[key]?.addEventListener("change", () => saveOptions(elements));
  });

  elements.reset?.addEventListener("click", () => resetOptions(elements));
});
