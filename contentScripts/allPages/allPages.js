/* Inject scripts don't forget to add them to web_accessible_resources in manifest */
injectScript(chrome.extension.getURL('/contentScripts/allPages/accessAllPages.js'), 'head');

/* disable annoying fuckn popup */
popup = document.querySelector('div.ad-alert-wrapper');
if(popup && popup.style.display !== "none")
    document.querySelector('button.ad-alert-message-continue-btn').click()