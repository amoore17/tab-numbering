/*
 * Title:             tab-numbering.js
 * Description:       Numbers your tabs!
 * Created by:        Tuomas Salo
 * Contributions by:  Austin Moore
 */

'use strict';

const browser = window.browser || window.chrome;

/*
 * Function:     update
 * Description:  Updates a tab to have the desired tab number
 * Parameters:   tab (tabs.Tab)
 *                 - The current tab
 * Returns:      void
 */
const update = tab => {
  const oldTitle = tab.title;
  let newTitle = oldTitle;

  if (!newTitle)
    return;

  const numbers = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

  // Take out one of these numbers if it already exists in the title
  if (numbers.includes(newTitle[0]))
    newTitle = newTitle.substring(1);

  let tabCount = 9;

  // If we are using Firefox
  if (browser === window.browser)
    tabCount = 8;

  if (tab.index < tabCount)
    newTitle = numbers[tab.index] + newTitle;

  if (oldTitle !== newTitle) {
    try {
      browser.tabs.executeScript(
        tab.id,
        {
          code: `document.title = ${JSON.stringify(newTitle)};`
        }
      );
      console.log(`Executed: ${tab.id}`);
    } catch(e) {
      console.log('Tab numbering error:', e);
    }
  }
};

/*
 * Function:     updateAll
 * Description:  Updates all tabs to have the desired tab numbers
 * Parameters:   void
 * Returns:      void
 */
const updateAll = () => {
  browser.tabs.query({}, tabs => {
    tabs.forEach(update);
  });
};

// Must listen for opening anchors in new tabs
browser.tabs.onCreated.addListener(updateAll);

// Must listen for tabs being attached from other windows
browser.tabs.onAttached.addListener(updateAll);

// Must listen for tabs being moved
browser.tabs.onMoved.addListener(updateAll);

// Must listen for tabs being removed
browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
   /* Check that the tab has been removed every 100ms
      Firefox fires onRemoved BEFORE it removes the tab */
  const checkTabRemoval = () => {
    browser.tabs.query({}, tabs => {
      if (tabs.filter(tab => tab.id === tabId).length === 0)
        updateAll();
      else
        setTimeout(checkTabRemoval, 100);
    });
  };

  checkTabRemoval();
});

// Must listen for tab updates
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  update(tab);
});

updateAll();
