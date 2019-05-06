var path = window.location.toString();
var args = path.split('&');
if (args[args.length -1] === 'do=search') {
    window.location.replace(path + '&order=desc&sort=publish_date');
}
else {
    var table = document.getElementsByTagName('tbody')[1];

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