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

export const renderBookmarks = async (
  nodes,
  container,
  folderName,
  showBackground,
  showIcons,
) => {
  if (!nodes?.length) return;

  const fragment = document.createDocumentFragment();

  const linkPromises = nodes.map((node) => {
    if (node.url) return createBookmarkLink(node, showBackground, showIcons);

    return Promise.resolve(null);
  });

  const links = await Promise.all(linkPromises);

  links.forEach((link) => {
    if (link) fragment.appendChild(link);
  });

  container.appendChild(fragment);
};

const pendingFetches = new Map();

const getFavicon = async (hostname) => {
  const url = `https://www.google.com/s2/favicons?domain=${hostname}&sz=256`;
  const cacheKey = `favicon-${hostname}`;

  return new Promise((resolve) => {
    chrome.storage.local.get([cacheKey], async (result) => {
      if (result[cacheKey]) {
        console.log(
          `%c[Cache] %c${hostname}`,
          "color: lime; font-weight: bold",
          "color: inherit",
        );
        resolve(result[cacheKey]);
        return;
      } else {
        console.log(
          `%c[Network] %c${hostname}`,
          "color: orange; font-weight: bold",
          "color: inherit",
        );
      }

      if (pendingFetches.has(hostname)) {
        resolve(await pendingFetches.get(hostname));
        return;
      }

      const fetchPromise = (async () => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          return new Promise((res) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result;
              try {
                chrome.storage.local.set({ [cacheKey]: base64data });
              } catch (e) {
                console.warn("Storage error saving favicon:", e);
              }
              res(base64data);
            };
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error("Error fetching favicon:", error);
          return url;
        }
      })();

      pendingFetches.set(hostname, fetchPromise);
      const data = await fetchPromise;
      pendingFetches.delete(hostname);
      resolve(data);
    });
  });
};

const createBookmarkLink = async (bookmark, showBackground, showIcons) => {
  if (!bookmark?.url) return null;

  const link = document.createElement("a");
  link.href = bookmark.url;
  link.className = "box";
  link.title = bookmark.title || bookmark.url;

  let hostname, faviconUrl;
  try {
    const url = new URL(bookmark.url);
    hostname = url.hostname;
    faviconUrl = await getFavicon(hostname);
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
