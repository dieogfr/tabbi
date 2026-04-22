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
  updateDatetime();
  updateSystemInfo();

  setInterval(updateDatetime, 1000);
  window.addEventListener("online", updateConnectionStatus);
  window.addEventListener("offline", updateConnectionStatus);
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

  if (groupedBookmarks._parent) {
    renderBookmarks(
      groupedBookmarks._parent,
      container,
      folderName,
      settings.boxbg,
      settings.showIcons,
    );
  }

  Object.entries(groupedBookmarks).forEach(([groupName, bookmarkItems]) => {
    if (groupName !== "_parent") {
      renderBookmarks(
        bookmarkItems,
        container,
        groupName,
        settings.boxbg,
        settings.showIcons,
      );
    }
  });
};

const updateDatetime = () => {
  const now = new Date();

  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  document.getElementById("datetime-time").textContent = now.toLocaleTimeString(
    "en-US",
    timeOptions,
  );
  document.getElementById("datetime-date").textContent = now.toLocaleDateString(
    "en-US",
    dateOptions,
  );
};

const updateSystemInfo = () => {
  const infoContainer = document.getElementById("system-info");
  const platform = getPlatformInfo();
  const browser = getBrowserInfo();
  console.log(navigator);

  infoContainer.innerHTML = `
    <span>${platform}</span>
    <span>•</span>
    <span>${browser}</span>
    ${navigator.deviceMemory ? `<span>•</span><span>${navigator.deviceMemory}GB RAM</span>` : ""}
  `;

  updateConnectionStatus();
};

const getPlatformInfo = () => {
  const ua = navigator.userAgent;
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("like Mac")) return "iOS";
  return "Unknown OS";
};

const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  return "Browser";
};

const updateConnectionStatus = () => {
  const text = document.getElementById("status-text");

  if (navigator.onLine) {
    text.textContent = "Secure Connection";
  } else {
    text.textContent = "Offline";
  }
};
