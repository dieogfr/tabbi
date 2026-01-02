export const getTabbiFolder = (folderName) => {
  return new Promise((resolve) => {
    chrome.bookmarks.search({ title: folderName }, (results) => {
      if (!results || results.length === 0) {
        resolve(null);
        return;
      }

      const folder = results.find((node) => !node.url);

      if (folder) {
        chrome.bookmarks.getSubTree(folder.id, (subTree) => {
          resolve(subTree[0]);
        });
      } else {
        resolve(null);
      }
    });
  });
};

export const groupBookmarks = (nodes) => {
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
