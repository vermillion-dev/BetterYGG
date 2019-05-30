/* Inject scripts don't forget to add them to web_accessible_resources in manifest */
injectScript(chrome.extension.getURL('/contentScripts/allPages/accessAllPages.js'), 'head');

/* disable annoying fuckn popup */
var popup = document.querySelector('div.ad-alert-wrapper');
if (popup && popup.style.display !== "none") {
    document.querySelector('button.ad-alert-message-continue-btn').click();
}

/* Retrieve credentials from Google Storage*/
chrome.storage.sync.get(['searchOrder', 'searchSort'], function (value) {
    /* Update links to order and filter them with our values */
    if (value.searchOrder && value.searchSort) {
        var elements = document.querySelectorAll('a[href$="do=search"]');
        for (var i = 0; i < elements.length; i++) {
            elements[i].href += '&order=' + value.searchOrder + '&sort=' + value.searchSort;
        }
    }
});
