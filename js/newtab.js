const BOOKMARKS_FOLDER_NAME = "Tabbi";
const ANIMATION_DELAY_INCREMENT = 50;

document.addEventListener("DOMContentLoaded", () => {
  const bookmarksContainer = document.getElementById("bookmarks");
  initializeUI(bookmarksContainer);
});

const initializeUI = (container) => {
  chrome.storage.sync.get(
    {
      animations: true,
      boxbg: true,
      compact: false,
      font: "monospace",
    },
    (settings) => {
      try {
        applyUISettings(settings, container);
        loadBookmarks(container, settings.boxbg);
      } catch (error) {
        console.error("Error applying settings:", error);
      }
    }
  );
};

const applyUISettings = (settings, container) => {
  document.body.setAttribute("data-animate", settings.animations);
  document.body.style.setProperty("--font", settings.font);
  container.setAttribute("data-compact", settings.compact);
};

const loadBookmarks = (container, showBackground) => {
  chrome.bookmarks.getTree((result) => {
    const nodes = result[0]?.children;
    if (!nodes) return displayNoBookmarksMessage(container);

    const targetFolder = findFolder(nodes, BOOKMARKS_FOLDER_NAME);
    if (!targetFolder) return displayNoBookmarksMessage(container);

    const groupedBookmarks = groupBookmarks(targetFolder.children);
    Object.entries(groupedBookmarks).forEach(([folderName, bookmarkItems]) => {
      renderBookmarks(bookmarkItems, container, folderName, showBackground);
    });
  });
};

const displayNoBookmarksMessage = (container) => {
  const message = document.createElement("p");
  message.className = "no-bookmarks";
  message.textContent = `Create a bookmarks folder named "${BOOKMARKS_FOLDER_NAME}" and start saving your links in it!`;
  container.appendChild(message);
};

const findFolder = (nodes, folderName) => {
  if (!nodes?.length) return null;

  for (const node of nodes) {
    if (node.title === folderName && node.children) return node;
    if (node.children) {
      const found = findFolder(node.children, folderName);
      if (found) return found;
    }
  }
  return null;
};

const groupBookmarks = (nodes) => {
  if (!nodes?.length) return { _parent: [] };

  return nodes.reduce(
    (groups, node) => {
      if (node.url) {
        groups._parent.push(node);
      } else if (node.children) {
        groups[node.title] = node.children;
      }
      return groups;
    },
    { _parent: [] }
  );
};

const renderBookmarks = (nodes, container, folderName, showBackground) => {
  if (!nodes?.length) return;

  const folderDiv = document.createElement("div");
  folderDiv.setAttribute("data-folder", folderName);
  folderDiv.className = "grid";

  nodes.forEach((node, index) => {
    if (node.url) {
      const bookmarkLink = createBookmarkLink(node, index * ANIMATION_DELAY_INCREMENT, showBackground);
      folderDiv.appendChild(bookmarkLink);
    }
  });

  container.appendChild(folderDiv);
};

const createBookmarkLink = (bookmark, delay, showBackground) => {
  if (!bookmark?.url) return null;

  const link = document.createElement("a");
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(bookmark.url).hostname)}&sz=32`;
  const safeTitle = bookmark.title || new URL(bookmark.url).hostname;

  link.href = bookmark.url;
  link.className = "box";
  link.style.animationDelay = `${delay}ms`;

  link.innerHTML = `
    ${showBackground ? `<div style="background-image: url('${faviconUrl}')" class="background"></div>` : ""}    
    <div class="header">
      <img src="${faviconUrl}" alt="${safeTitle} icon" class="icon" />
      <div class="title">${safeTitle}</div>
    </div>
  `;

  return link;
};
