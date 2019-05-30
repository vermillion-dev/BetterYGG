/* Inject scripts don't forget to add them to web_accessible_resources in manifest */
injectScript(chrome.extension.getURL('contentScripts/search/accessSearch.js'), 'head');

    function addDlButton(idx, torrentId, yggToken) {
        var cell = table.rows[idx].cells[2];
        var downloadButton = document.createElement('a')
        var downloadIcon = document.createElement('img')
        downloadIcon.setAttribute('src', chrome.extension.getURL("img/download.png"));
        downloadButton.appendChild(downloadIcon);
        downloadButton.setAttribute('href', "https://www2.yggtorrent.ch/rss/download?id=" + torrentId + "&passkey=" + yggToken);
        cell.appendChild(downloadButton);
    }

    chrome.storage.sync.get(['yggToken'], function(value){
        if(value.yggToken){
            for (var i = 0; i < table.rows.length; i++) {
                var torrentId = table.rows[i].cells[2].children[0].getAttribute('target')
                addDlButton(i, torrentId, value.yggToken);
            }
        }
    });
}