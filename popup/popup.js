function clearChildNodes(parent) {
  if(!parent || !parent.firstChild) return;

  while(parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function createBookmarkListItem(bookmark, parentId, fab) {
if(parentId == 0) fab.classList.add('hide');
else if (parentId != 0 && fab.classList.contains('hide')) fab.classList.remove('hide');


  // Create element
const bookmarkListItem = document.createElement("li");
bookmarkListItem.classList.add('collection-item', 'avatar', 'bookmark-list__item');

// Append icon
const iconInnerHtml = bookmark.children ? 'folder' : 'bookmark';
const iconClasses = ['material-icons', 'circle'];

if(bookmark.children) iconClasses.push('black');
else if(bookmark.url) iconClasses.push('deep-orange');

const bookmarkListItemIcon = document.createElement('i');
bookmarkListItemIcon.classList.add(...iconClasses);
bookmarkListItemIcon.innerHTML = iconInnerHtml;
bookmarkListItem.appendChild(bookmarkListItemIcon);

// Append title
const title = document.createElement('span');
title.innerHTML = bookmark.title;
title.classList.add('title');
bookmarkListItem.appendChild(title);

if(bookmark.children) {
  bookmarkListItem.onclick = function(event){
    clearChildNodes(bookmarkList);
    init(bookmark.id)
  }

  // Create open all button
  const openAllButton = document.createElement('button');
  openAllButton.classList.add('waves-effect', 'waves-light', 'btn-small');
  openAllButton.onclick = function(event){
    const urls = bookmark.children.filter(child => child.url).map(child => child.url);
    urls.forEach(url => chrome.tabs.create({ url }));
  }
  const buttonIcon = document.createElement('i');
  buttonIcon.classList.add('material-icons', 'left');
  buttonIcon.innerHTML = 'open_in_new';
  openAllButton.append(buttonIcon, 'Open All');



// Create bookmarks badge
  const bookmarkBadge = document.createElement('span');
  bookmarkBadge.classList.add('badge');
  bookmarkBadge.setAttribute('data-badge-caption', 'Bookmarks');
  bookmarkBadge.innerHTML = bookmark.children.filter(child => !child.children).length;

  // Append left side container
  const leftContentContainer = document.createElement('div');
  leftContentContainer.classList.add("folder-item__left-content-container", "secondary-content");
  leftContentContainer.append(bookmarkBadge, openAllButton);
  bookmarkListItem.appendChild(leftContentContainer);



  // Append date modified
  const dateModified = document.createElement('p');
  const formattedDate = moment.unix(bookmark.dateGroupModified/1000).format('D-M-YYYY h:mm a')
  dateModified.innerHTML = `Last modified: ${formattedDate}`;
  bookmarkListItem.appendChild(dateModified);
}

// Append URL
if(bookmark.url) {
  bookmarkListItem.onclick = function(event){
    chrome.tabs.create({url: bookmark.url})
  }


  const bookmarkUrl = document.createElement('a');
  bookmarkUrl.classList.add('text-darken-2', 'bookmark-list__item-link', 'truncate');
  bookmarkUrl.innerHTML = bookmark.url;
  bookmarkUrl.setAttribute('href', bookmark.url);
  bookmarkUrl.setAttribute('target', '__blank');

  bookmarkListItem.appendChild(bookmarkUrl);
}

return bookmarkListItem;
}


const bookmarkList = document.querySelector('.bookmark-list');
const footerCopyright = document.getElementById('popup-footer-copyright');

//Footer
footerCopyright.innerHTML = `© ${moment().format('YYYY')} Bookmark Hero`;

// Bookmark list
function flattenTree(children, flattenedBookmarks) {
  if(!children) return;
  children.forEach(child => {
    if(child.children) {
      flattenTree(child.children, flattenedBookmarks);
    }
   flattenedBookmarks.push(child)
  })
}



function init(parentId) {
  console.log(parentId, "PID");


  chrome.bookmarks.getTree(tree => {
    let flattenedBookmarks = [];
    
    flattenTree(tree, flattenedBookmarks);

    console.log(flattenedBookmarks, "FLATTENED BOOKMARKS")


    const bookmarks = flattenedBookmarks.filter(bookmark => bookmark.parentId == parentId);

    
    
    // Fixed action button
    const fab = document.querySelectorAll('.fixed-action-btn')[0];

    fab.onclick = function() {
      const currentBookmark = flattenedBookmarks.filter(bm => bm.id == parentId)[0];
      if(currentBookmark.parentId) clearChildNodes(bookmarkList);
      
      const nextId = !currentBookmark.parentId ? 0 : currentBookmark.parentId;
      if(currentBookmark.parentId) init(nextId);
    }

    // Search input
    const searchInput = document.querySelector('#search');
    searchInput.addEventListener("input", function(event) {
      const results = flattenedBookmarks.filter(bm => bm.title.toLowerCase().includes(event.target.value.toLowerCase()) && bm.parentId == parentId);
      if(results.length) {
        clearChildNodes(bookmarkList);
        results.forEach(result => {
          const bookmarkItem = createBookmarkListItem(result, parentId, fab);
          bookmarkList.appendChild(bookmarkItem);
        });
      };
    });

    bookmarks.forEach(bookmark => {
      const bookmarkListItem = createBookmarkListItem(bookmark, parentId, fab);
      bookmarkList.appendChild(bookmarkListItem);
    });
  });
};

// Begin program

init(0);


