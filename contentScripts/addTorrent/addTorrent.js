/* Inject scripts don't forget to add them to web_accessible_resources in manifest */
injectScript(chrome.extension.getURL('contentScripts/addTorrent/accessAddTorrent.js'), 'head');
injectLink(chrome.extension.getURL("css/style.css"), 'head');

/********************************************************************/
/********************************************************************/
/********************************************************************/

var path = window.location.pathname;

/* Add an info line to the table */
var tableLines =  document.querySelectorAll('table.infos-torrent tbody tr')
var downloadLine = tableLines[1];
var torrentInfo = downloadLine.cloneNode(true);
torrentInfo.style = "display: none";
downloadLine.insertAdjacentElement('afterend', torrentInfo);

/* Add third party download button */
var downloadButton = downloadLine.querySelector('a.butt');
flexButton = document.createElement('a');
flexButton.appendChild(document.createTextNode("Télécharger via discord "));
var span = document.createElement('span');
span.className = "ico_download";
flexButton.appendChild(span);
flexButton.className = "butt discord"
flexButton.style = "display: none";
flexButton.addEventListener('click', addToDiscord);
downloadButton.parentElement.appendChild(flexButton);

/* Retrieve torrent data from page*/
var torrentId = (/.*\/torrent\/.*\/.*\/(\d+)\-/g).exec(window.location.pathname);
if(torrentId){
    torrentId = torrentId[1]
}
var torrentTitle = document.querySelector('div#title h1').textContent.trim().split(".").join(" ");
torrentYear = (/(19\d{2}|2\d{3})/g).exec(torrentTitle)
if(torrentYear){
    torrentYear = torrentYear[1]
}
if(torrentTitle.includes('1080'))
    torrentQuality = '1080p';
else if(torrentTitle.includes('720'))
    torrentQuality = '720p';
else if(torrentTitle.includes('480'))
    torrentQuality = '480p';

/* Retrieve credentials from Google Storage*/
var discordWebhookUrl, discordUserName, categories;
chrome.storage.sync.get(['yggToken', 'discordWebhookUrl', 'discordUserName', 'displayDiscord', 'displayAddCategories', 'categories', 'defaultCategories'], function(value){
    if(value.yggToken){
        downloadButton.setAttribute('href', "https://www2.yggtorrent.ch/rss/download?id=" + torrentId + "&passkey=" + value.yggToken);
    }
    else{
        var alertYggToken = '<div id="error_ygg_button_alert" class="alert alert-danger" role="alert" style="margin-bottom:0;">Une erreur est survenue, Vérifiez que votre token Ygg soit chargé !</div>';
        if (document.readyState !== "complete"){
            document.addEventListener('readystatechange', function onReadyStateChange() {
                downloadLine.childNodes[3].innerHTML = alertYggToken;
            }, false);
        } else {
            downloadLine.childNodes[3].innerHTML = alertYggToken;
        }
    }
    if(value.displayDiscord){
        if(value.discordWebhookUrl){
            discordWebhookUrl = value.discordWebhookUrl;
        }
        else{
            showAlert('error_discord_button_alert')
        }
        if(value.discordUserName){
            discordUserName = value.discordUserName;
        }
        else{
            discordUserName = "BetterYGG - Extension"
        }

        if(value.displayAddCategories){
            if(value.categories){
                categories = value.categories;
                if(categories.length === 0){
                    showAlert('error_categories_alert')
                }
            }
            else{
                showAlert('error_categories_alert')
            }
        }
        else {
            if(value.defaultCategories){
                categories = value.defaultCategories;
            }
        }

        /* Retrieve torrent data from page*/
        var torrentType = getTypeFromUrl(categories);
        var torrentEpisode = '', torrentSeason = '', torrentQuality = '';
        if(torrentType.season){
            document.querySelectorAll('a.term').forEach(function(element){
                var key = element.innerHTML
                if(key.includes('Saison'))
                    torrentSeason = key.replace('Saison ', '');
                if(key.includes('Episode'))
                    torrentEpisode = key.replace('Episode ', '');
            });
        }

        /* Style info line */
        var left = torrentInfo.childNodes[1];
        left.removeChild(left.childNodes[0]);
        left.prepend(document.createTextNode("Infos "));
        left.childNodes[1].className = 'ico_info-circle';
        var right = torrentInfo.childNodes[3];
        /* Add alert banners */
        right.innerHTML = '<div id="valid_form_alert" class="alert alert-success" role="alert" style="display: none">C\'est un succes, le torrent a été envoyé !</div>'
        right.innerHTML += '<div id="error_form_alert" class="alert alert-danger" role="alert" style="display: none">Une erreur est survenue, Vérifiez le formulaire çi dessous.!</div>';
        right.innerHTML += '<div id="error_discord_button_alert" class="alert alert-danger" role="alert" style="display: none">Une erreur est survenue, Vérifiez que votre url Discord Webhook soit correcte !</div>';
        right.innerHTML += '<div id="error_categories_alert" class="alert alert-danger" role="alert" style="display: none">Une erreur est survenue, La liste des catégories est vide !</div>';

        /* Creation of form */
        var formNode = document.createElement('form');
        formNode.name = "form_info";
        formNode.className = "form-horizontal";
        right.appendChild(formNode);

        var row = document.createElement('div');
        row.className = "row";
        row.appendChild(getInputCol("Titre", "title", ["error"], "text", torrentTitle,
            {
                onInput:function() {
                    this.classList.remove('error')
                }
            })
        );
        formNode.appendChild(row);

        formNode.appendChild(getSecondRow(torrentType, torrentSeason, torrentEpisode, torrentId, torrentYear, torrentQuality, categories));
        torrentInfo.style.display = "";
        flexButton.style.display = "";
    }
});