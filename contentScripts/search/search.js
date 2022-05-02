/* Inject scripts don't forget to add them to web_accessible_resources in manifest */
injectScript(chrome.runtime.getURL('contentScripts/search/accessSearch.js'), 'head');

/********************************************************************/

/* Retrieve credentials from Google Storage*/
chrome.storage.sync.get(['yggToken'], function (value) {
    if (value.yggToken) {
        /* Add a download button on each torrent line */
        var table = document.getElementsByTagName('tbody')[1];
        for (var i = 0; i < table.rows.length; i++) {
            var torrentId = table.rows[i].cells[2].children[0].getAttribute('target')
            var cell = table.rows[i].cells[2];
            var downloadButton = document.createElement('a')
            var downloadIcon = document.createElement('img')
            downloadIcon.setAttribute('src', chrome.runtime.getURL("img/download.png"));
            downloadButton.appendChild(downloadIcon);
            downloadButton.setAttribute('href', "https://" + window.location.host + "/rss/download?id=" + torrentId + "&passkey=" + value.yggToken);
            cell.appendChild(downloadButton);
        }
    }
});
