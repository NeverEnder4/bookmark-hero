var Formatter = function() {
  // Recursive function to flatten bookmark tree data structure
  function flattenTree(children, flattenedBookmarks) {
    if(!children) return;
    children.forEach(child => {
      if(child.children) {
        flattenTree(child.children, flattenedBookmarks);
      }
     flattenedBookmarks.push(child)
    })
  }
  return {
    flattenTree
  }
}