export const applyUISettings = (settings, container) => {
  document.body.style.setProperty(
    "--items-per-column",
    settings.itemsPerColumn,
  );

  if (settings.background) {
    if (
      settings.background.startsWith("#") ||
      settings.background.startsWith("rgb") ||
      settings.background.startsWith("oklch")
    ) {
      document.body.style.backgroundColor = settings.background;
      document.body.style.backgroundImage = "none";
    } else {
      document.body.style.backgroundImage = `url(${settings.background})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
    }
  }

  container.setAttribute("data-compact", settings.compact);
};

export const renderBookmarks = (
  nodes,
  container,
  folderName,
  showBackground,
  showIcons,
) => {
  if (!nodes?.length) return;

  const fragment = document.createDocumentFragment();
  nodes.forEach((node) => {
    if (node.url) {
      const bookmarkLink = createBookmarkLink(node, showBackground, showIcons);
      if (bookmarkLink) fragment.appendChild(bookmarkLink);
    }
  });

  container.appendChild(fragment);
};

const createBookmarkLink = (bookmark, showBackground, showIcons) => {
  if (!bookmark?.url) return null;

  const link = document.createElement("a");
  link.href = bookmark.url;
  link.className = "box";
  link.title = bookmark.title || bookmark.url;

  let hostname, faviconUrl;
  try {
    const url = new URL(bookmark.url);
    hostname = url.hostname;
    faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=256`;
  } catch {
    faviconUrl = null;
  }

  if (showBackground && faviconUrl) {
    const bg = document.createElement("img");
    bg.src = faviconUrl;
    bg.className = "box-background";
    bg.alt = "";
    link.appendChild(bg);
  }

  if (showIcons && faviconUrl) {
    const icon = document.createElement("img");
    icon.src = faviconUrl;
    icon.className = "box-icon";
    icon.alt = "";
    link.appendChild(icon);
  }

  const title = document.createElement("span");
  title.className = "box-title";
  title.textContent = bookmark.title || hostname || bookmark.url;
  link.appendChild(title);

  return link;
};

export const displayNoBookmarksMessage = (container, folderName) => {
  container.innerHTML = `
    <div class="no-bookmarks">
      <h2>Welcome to tabbi</h2>
      <p>Create a bookmarks folder named "<strong>${folderName}</strong>" to see your links here.</p>
    </div>
  `;
};
