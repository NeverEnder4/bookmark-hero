const Dom = new DomHelpers();
const ListItem = new BookmarkListItem();
const Format = new Formatter();

// Dom Nodes
const fab = document.querySelectorAll('.fixed-action-btn')[0];
const searchInput = document.querySelector('#search');
const bookmarkList = document.querySelector('.bookmark-list');
const footerCopyright = document.getElementById('popup-footer-copyright');
const breadcrumbContainer = document.querySelector('#header-breadcrumb-container');
const breadcrumbOpenAllContainer = document.querySelector('#breadcrumb-open-all-container');


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

    const currentBookmark = flattenedBookmarks.filter(bm => bm.parentId == parentId)[0];
    const previousBookmark = flattenedBookmarks.filter(bm => bm.id == parentId)[0];
    console.log(previousBookmark, currentBookmark, "PBN");

    const currentFolderBookmarks = previousBookmark.children.filter(bm => bm.url);

    Dom.clearChildNodes(breadcrumbOpenAllContainer);
    if(currentFolderBookmarks.length > 0) {
      if(breadcrumbOpenAllContainer.classList.contains('hide'))breadcrumbOpenAllContainer.classList.remove('hide');
      // Breadcrumb Open All Button
      const breadcrumbOpenAllButton = Dom.createDomNode('button');
      breadcrumbOpenAllButton.setAttribute('id', 'breadcrumb-open-all');
      breadcrumbOpenAllButton.classList.add('waves-effect', 'waves-light', 'btn-small');

      const breadcrumbOpenAllIcon = Dom.createDomNode('i');
      breadcrumbOpenAllIcon.classList.add('material-icons', 'left', 'breadcrumb-header__button-icon');
      breadcrumbOpenAllIcon.innerHTML = "open_in_new";
      breadcrumbOpenAllButton.append(breadcrumbOpenAllIcon, currentFolderBookmarks.length);
      breadcrumbOpenAllButton.onclick = function() {
        currentFolderBookmarks.forEach(bookmark => {
          chrome.tabs.create({url: bookmark.url});
        });
      };

      breadcrumbOpenAllContainer.appendChild(breadcrumbOpenAllButton);
    }
    

    // Breadcrumb
    function createBreadcrumb(isCurrentLocation) {
      const breadcrumb = Dom.createDomNode('a');
      breadcrumb.classList.add('breadcrumb', 'breadcrumb__link');
      breadcrumb.setAttribute('href', '#');
      breadcrumb.innerHTML = isCurrentLocation ?  previousBookmark.title : 'Home';

      if(isCurrentLocation) breadcrumb.classList.add('breadcrumb__link--current');
      else breadcrumb.onclick = function() {
        if(isCurrentLocation) return;
        if(parentId != 0) refetchList(0);
      }

      return breadcrumb;
    }

    Dom.clearChildNodes(breadcrumbContainer);
    const currentBreadcrumb = createBreadcrumb(true);
    const homeBreadcrumb = createBreadcrumb();
    breadcrumbContainer.appendChild(homeBreadcrumb);
    if(previousBookmark.title) breadcrumbContainer.appendChild(currentBreadcrumb);
    

    //Footer
    footerCopyright.innerHTML = `© ${moment().format('YYYY')} Bookmark Hero`;
  
    // Fixed action button
    fab.onclick = function() {
      const previousId = !previousBookmark.parentId ? 0 : previousBookmark.parentId;
      if(previousBookmark.parentId) refetchList(previousId) ;
    }

    // Search input
    searchInput.addEventListener("input", function(event) {
      const results = flattenedBookmarks.filter(bm => bm.title.toLowerCase().includes(event.target.value.toLowerCase()));
      if(results.length) {
        Dom.clearChildNodes(bookmarkList);

        if(event.target.value.length > 1) {
          results.forEach(result => {
            const bookmarkItem = ListItem.createElement(result, parentId, fab, refetchList);
            bookmarkList.appendChild(bookmarkItem);
          });
        } else {
          bookmarks.forEach(bookmark => {
            const bookmarkItem = ListItem.createElement(bookmark, parentId, fab, refetchList);
            bookmarkList.appendChild(bookmarkItem);
          });
        }
      };
    });
    searchInput.setAttribute('placeholder', 'Search bookmarks')

    bookmarks.forEach(bookmark => {
      const bookmarkListItem = ListItem.createElement(bookmark, parentId, fab, refetchList);
      bookmarkList.appendChild(bookmarkListItem);
    });
  });
};

// Begin 
var elems = document.querySelectorAll('.dropdown-trigger');
    var instances = M.Dropdown.init(elems, {});
renderBookmarkList(0);


