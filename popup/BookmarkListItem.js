var BookmarkListItem = function() {

  function createElement(bookmark, parentId, fab, refetchList) {
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
      bookmarkListItem.onclick = function(){
        if (refetchList && typeof refetchList === 'function') refetchList(bookmark.id);
        else throw Error('`refetchList` arg must be a function');
      }
    
      // Create open all button
      const openAllButton = document.createElement('button');
      // openAllButton.classList.add('waves-effect', 'waves-light', 'btn-small');
      openAllButton.onclick = function(){
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
    
    if(bookmark.url) {
      bookmarkListItem.onclick = function(event){
        chrome.tabs.create({url: bookmark.url})
      }
    
      // Append URL
      const bookmarkUrl = document.createElement('a');
      bookmarkUrl.classList.add('text-darken-2', 'bookmark-list__item-link', 'truncate');
      bookmarkUrl.innerHTML = bookmark.url;
      bookmarkUrl.setAttribute('href', bookmark.url);
      bookmarkUrl.setAttribute('target', '__blank');
    
      bookmarkListItem.appendChild(bookmarkUrl);
    }
    
    return bookmarkListItem;
    }

    return {
      createElement
    }
}