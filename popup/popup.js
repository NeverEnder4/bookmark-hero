const Dom = new DomHelpers();
const ListItem = new BookmarkListItem();
const Format = new Formatter();

// Dom Nodes
const fab = document.querySelectorAll('.fixed-action-btn')[0];
const searchInput = document.querySelector('#search');
const bookmarkList = document.querySelector('.bookmark-list');
const footerCopyright = document.getElementById('popup-footer-copyright');


function refetchList(bookmarkId) {
  Dom.clearChildNodes(bookmarkList);
  renderBookmarkList(bookmarkId);
}

function renderBookmarkList(parentId) {
  chrome.bookmarks.getTree(tree => {
    let flattenedBookmarks = [];
    
    // Format incoming data
    Format.flattenTree(tree, flattenedBookmarks);
    const bookmarks = flattenedBookmarks.filter(bookmark => bookmark.parentId == parentId);

    //Footer
    footerCopyright.innerHTML = `© ${moment().format('YYYY')} Bookmark Hero`;
  
    // Fixed action button
    fab.onclick = function() {
      const currentBookmark = flattenedBookmarks.filter(bm => bm.id == parentId)[0];
      
      const nextId = !currentBookmark.parentId ? 0 : currentBookmark.parentId;
      if(currentBookmark.parentId) refetchList(nextId) ;
    }

    // Search input
    searchInput.addEventListener("input", function(event) {
      const results = flattenedBookmarks.filter(bm => bm.title.toLowerCase().includes(event.target.value.toLowerCase()) && bm.parentId == parentId);
      if(results.length) {
        Dom.clearChildNodes(bookmarkList);
        results.forEach(result => {
          const bookmarkItem = ListItem.createElement(result, parentId, fab, refetchList);
          bookmarkList.appendChild(bookmarkItem);
        });
      };
    });

    bookmarks.forEach(bookmark => {
      const bookmarkListItem = ListItem.createElement(bookmark, parentId, fab, refetchList);
      bookmarkList.appendChild(bookmarkListItem);
    });
  });
};

// Begin 
renderBookmarkList(0);


