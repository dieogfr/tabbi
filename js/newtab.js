import { getTabbiFolder, groupBookmarks } from "./bookmarks.js";
import { defaultSettings } from "./options.js";
import {
  applyUISettings,
  displayNoBookmarksMessage,
  renderBookmarks,
} from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  const bookmarksContainer = document.getElementById("bookmarks");
  initializeUI(bookmarksContainer);
});

const initializeUI = (container) => {
  chrome.storage.sync.get(
    {
      boxbg: defaultSettings.boxbg.value,
      compact: defaultSettings.compact.value,
      itemsPerColumn: defaultSettings.itemsPerColumn.value,
      background: defaultSettings.background.value,
      showIcons: defaultSettings.showIcons.value,
      bookmarkFolder: defaultSettings.bookmarkFolder.value,
    },
    async (settings) => {
      try {
        applyUISettings(settings, container);
        await loadBookmarks(container, settings);
      } catch (error) {
        console.error("Error applying settings:", error);
      }
    },
  );
};

const loadBookmarks = async (container, settings) => {
  const folderName = settings.bookmarkFolder || "tabbi";
  const targetFolder = await getTabbiFolder(folderName);

  if (!targetFolder || !targetFolder.children) {
    return displayNoBookmarksMessage(container, folderName);
  }

  const groupedBookmarks = groupBookmarks(targetFolder.children);
  Object.entries(groupedBookmarks).forEach(([groupName, bookmarkItems]) => {
    renderBookmarks(
      bookmarkItems,
      container,
      groupName,
      settings.boxbg,
      settings.showIcons,
    );
  });
};
