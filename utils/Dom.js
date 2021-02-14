var DomHelpers = function() {
  function createDomNode(element) {
    return document.createElement(element);
  };

  function clearChildNodes(parent) {
    if(!parent || !parent.firstChild) return;
  
    while(parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  return {
    createDomNode,
    clearChildNodes,
  }
} 




