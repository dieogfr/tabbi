export const applyUISettings = (settings, container) => {
  document.body.style.setProperty("--items-per-column", settings.itemsPerColumn);
  updateBoxSize(settings.itemsPerColumn);
  document.body.style.backgroundColor = settings.background;

  container.setAttribute("data-compact", settings.compact);
};

export const updateBoxSize = (itemsPerColumn) => {
  const boxSize =
    (window.innerWidth - 32) / itemsPerColumn > 200
      ? "200px"
      : `clamp(120px, calc((100vw - 32px - var(--grid-gap) * (${itemsPerColumn} - 1)) / ${itemsPerColumn}), 200px)`;

  document.body.style.setProperty("--box-size", boxSize);
};

export const renderBookmarks = (nodes, container, folderName, showBackground, showIcons) => {
  if (!nodes?.length) return;

  const folderDiv = document.createElement("div");
  folderDiv.setAttribute("data-folder", folderName);
  folderDiv.className = "grid";

  const fragment = document.createDocumentFragment();
  nodes.forEach((node) => {
    if (node.url) {
      const bookmarkLink = createBookmarkLink(node, showBackground, showIcons);
      if (bookmarkLink) fragment.appendChild(bookmarkLink);
    }
  });

  folderDiv.appendChild(fragment);
  container.appendChild(folderDiv);
};

const createBookmarkLink = (bookmark, showBackground, showIcons) => {
  if (!bookmark?.url) return null;

  const link = document.createElement("a");
  link.href = bookmark.url;
  link.className = "box";

  let url, hostname, safeTitle, faviconUrl;
  try {
    url = new URL(bookmark.url);
    hostname = url.hostname;
    safeTitle = bookmark.title || hostname;
    faviconUrl =
      showIcons || showBackground
        ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=256`
        : null;
    // from what i've noticed, 256w is the only option with decent icons
  } catch {
    safeTitle = bookmark.title || bookmark.url;
    faviconUrl = null;
  }

  if (showBackground && faviconUrl) {
    const bgDiv = document.createElement("div");
    bgDiv.className = "background";

    const bgImg = document.createElement("img");
    bgImg.src = faviconUrl;
    bgImg.loading = "lazy";
    bgImg.className = "background-image";
    bgImg.alt = "";

    bgDiv.appendChild(bgImg);
    link.appendChild(bgDiv);
  }

  const header = document.createElement("div");
  header.className = "header";

  if (showIcons && faviconUrl) {
    const icon = document.createElement("img");
    icon.src = faviconUrl;
    icon.alt = `${safeTitle} icon`;
    icon.className = "icon";
    icon.loading = "lazy";
    header.appendChild(icon);
  }

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = safeTitle;
  header.appendChild(title);

  link.appendChild(header);
  return link;
};

export const displayNoBookmarksMessage = (container, folderName) => {
  const message = document.createElement("p");
  message.className = "no-bookmarks";
  message.textContent = `Create a bookmarks folder named "${folderName}" and start saving your links in it!`;
  container.appendChild(message);
};
