/* Inject scripts don't forget to add them to web_accessible_resources in manifest */
injectScript(chrome.extension.getURL('contentScripts/addTorrent/accessAddTorrent.js'), 'head');
injectLink(chrome.extension.getURL("css/style.css"), 'head');

/********************************************************************/

var path = window.location.pathname;

/* Add an info line to the table */
var tableLines = document.querySelectorAll('table.infos-torrent tbody tr');
var downloadLine = tableLines[0];
var torrentInfo = downloadLine.cloneNode(true);
torrentInfo.style.display = 'none';
downloadLine.insertAdjacentElement('afterend', torrentInfo);

/* Add third party download button */
var downloadButton = downloadLine.querySelector('a.butt');
var flexButton = document.createElement('a');
flexButton.appendChild(document.createTextNode('Télécharger via discord '));
var span = document.createElement('span');
span.classList.add('ico_download');
flexButton.appendChild(span);
flexButton.classList.add('butt', 'discord');
flexButton.style.display = 'none';
flexButton.addEventListener('click', addToDiscord);
downloadButton.parentElement.appendChild(flexButton);

/* Retrieve torrent data from page*/
var torrentId = (/.*\/torrent\/.*\/.*\/(\d+)-/g).exec(window.location.pathname);
if (torrentId) {
    torrentId = torrentId[1];
}
var torrentTitle = document.querySelector('div#title h1').textContent.trim().split('.').join(' ');
var torrentYear = (/(19\d{2}|2\d{3})/g).exec(torrentTitle);
if (torrentYear) {
    torrentYear = torrentYear[1];
}
var torrentQuality = '';
if (torrentTitle.includes('1080')) {
    torrentQuality = '1080p';
} else if (torrentTitle.includes('720')) {
    torrentQuality = '720p';
} else if (torrentTitle.includes('480')) {
    torrentQuality = '480p';
}

/* Retrieve credentials from Google Storage*/
var discordWebhookUrl, discordUserName, categories;
chrome.storage.sync.get(['yggToken', 'discordWebhookUrl', 'discordUserName', 'displayDiscord', 'displayAddCategories', 'categories', 'defaultCategories'], function (value) {
    if (value.yggToken) {
        downloadButton.setAttribute('href', `https://${window.location.host}/rss/download?id=${torrentId}&passkey=${value.yggToken}`);
    } else {
        var alertYggToken = '<div id="error_ygg_button_alert" class="alert alert-danger" role="alert" style="margin-bottom:0;">Une erreur est survenue, Vérifiez que votre token Ygg soit chargé !</div>';
        if (document.readyState !== 'complete') {
            document.addEventListener('readystatechange', function () {
                downloadLine.childNodes[3].innerHTML = alertYggToken;
            }, false);
        } else {
            downloadLine.childNodes[3].innerHTML = alertYggToken;
        }
    }
    if (value.displayDiscord) {
        if (value.discordWebhookUrl) {
            discordWebhookUrl = value.discordWebhookUrl;
        } else {
            showAlert('error_discord_button_alert');
        }
        if (value.discordUserName) {
            discordUserName = value.discordUserName;
        } else {
            discordUserName = "BetterYGG - Extension";
        }

        if (value.displayAddCategories) {
            if (value.categories) {
                categories = value.categories;
                if (categories.length === 0) {
                    showAlert('error_categories_alert');
                }
            } else {
                showAlert('error_categories_alert');
            }
        } else {
            if (value.defaultCategories) {
                categories = value.defaultCategories;
            }
        }

        /* Retrieve torrent data from page*/
        var torrentType = getTypeFromUrl(categories);
        var torrentEpisode = '', torrentSeason = '';
        if (torrentType.season) {
            document.querySelectorAll('a.term').forEach(function (element) {
                var key = element.innerHTML;
                if (key.includes('Saison')) {
                    torrentSeason = key.replace('Saison ', '');
                }
                if (key.includes('Episode')) {
                    torrentEpisode = key.replace('Episode ', '');
                }
            });
        }

        /* Style info line */
        var left = torrentInfo.childNodes[1];
        left.removeChild(left.childNodes[0]);
        left.prepend(document.createTextNode("Infos "));
        left.childNodes[1].className = 'ico_info-circle';
        var right = torrentInfo.childNodes[3];
        /* Add alert banners */
        right.innerHTML = '<div id="valid_form_alert" class="alert alert-success" role="alert" style="display: none">C\'est un succes, le torrent a été envoyé !</div>';
        right.innerHTML += '<div id="error_form_alert" class="alert alert-danger" role="alert" style="display: none">Une erreur est survenue, Vérifiez le formulaire çi dessous.!</div>';
        right.innerHTML += '<div id="error_discord_button_alert" class="alert alert-danger" role="alert" style="display: none">Une erreur est survenue, Vérifiez que votre url Discord Webhook soit correcte !</div>';
        right.innerHTML += '<div id="error_categories_alert" class="alert alert-danger" role="alert" style="display: none">Une erreur est survenue, La liste des catégories est vide !</div>';

        /* Creation of form */
        var formNode = document.createElement('form');
        formNode.name = 'form_info';
        formNode.classList.add('form-horizontal');
        right.appendChild(formNode);

        var row = document.createElement('div');
        row.classList.add('row');
        row.appendChild(getInputCol("Titre", 'title', ['error'], 'text', torrentTitle,
            {
                onInput: function () {
                    this.classList.remove('error');
                }
            })
        );
        formNode.appendChild(row);

        formNode.appendChild(getSecondRow(torrentType, torrentSeason, torrentEpisode, torrentId, torrentYear, torrentQuality, categories));
        torrentInfo.style.display = '';
        flexButton.style.display = '';
    }
});

/*************/
/* FUNCTIONS */
/*************/

function alert(id) {
    document.querySelectorAll('.alert').forEach(function (elem) {
        elem.style.display = 'none';
    });
    document.getElementById(id).style.display = 'block';
}

function showAlert(id) {
    if (document.readyState !== 'complete') {
        document.addEventListener('readystatechange', function () {
            alert(id);
        }, false);
    } else {
        alert(id);
    }
}

function addToDiscord() {
    if (discordWebhookUrl === undefined) {
        showAlert('error_discord_button_alert');
        return;
    }

    var inputs = document.forms['form_info'].querySelectorAll('input, select');
    var dict = {};

    for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        if (!input) {
            continue;
        }
        if (input.classList.contains('error')) {
            showAlert('error_form_alert');
            return;
        }
        dict[input.name] = input.value;
    }

    var data = {
        content: JSON.stringify(dict),
        username: discordUserName,
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', discordWebhookUrl);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status === 204) {
           showAlert('valid_form_alert');
        } else {
            showAlert('error_discord_button_alert');
        }
    };
    xhr.send(JSON.stringify(data));
}

/*********************/
/* GET HTML ELEMENTS */
/*********************/

function getInput(name, classes, type, value, attrs = {}) {
    var inputNode = document.createElement('input');
    inputNode.name = name;
    inputNode.classList.add('form-control', ...classes);
    inputNode.setAttribute('type', type);
    for (var key in attrs) {
        inputNode.setAttribute(key, attrs[key]);
    }
    inputNode.value = value;
    return inputNode;
}

function getSelect(name, classes, options, selected, attrs = {}) {
    var selectNode = document.createElement('select');
    selectNode.name = name;
    selectNode.classList.add('form-control', ...classes);
    for (var key in attrs) {
        selectNode.setAttribute(key, attrs[key]);
    }
    for (var index in options) {
        var type = options[index];
        var option = document.createElement('option');
        option.value = type;
        option.text = type;
        if (type === selected) {
            option.setAttribute('selected', 'selected');
        }
        selectNode.appendChild(option);
    }
    return selectNode;
}

function getFormGroup(input, label, name, size) {
    var labelNode = document.createElement('label');
    labelNode.classList.add('control-label');
    labelNode.setAttribute('for', name);
    labelNode.appendChild(document.createTextNode(label));

    var div = document.createElement('div');
    div.classList.add('form-group', `col-${size}`);
    div.appendChild(labelNode);
    div.appendChild(input);
    return div;
}

function getInputCol(label, name, classes, type, value, {size = 12, attrs = {}, onInput = false}) {
    var input = getInput(name, classes, type, value, attrs);
    if (onInput) {
        input.addEventListener('input', onInput);
    }
    return getFormGroup(input, label, name, size);
}

function getSelectCol(label, name, classes, options, selected, {size = 12, attrs = {}, onInput = false}) {
    var select = getSelect(name, classes, options, selected, attrs);
    if (onInput) {
        select.addEventListener('input', onInput);
    }
    return getFormGroup(select, label, name, size);
}

function getSecondRow(torrentType, torrentSeason, torrentEpisode, torrentId, torrentYear, torrentQuality, categories) {
    var size = 3;
    var classes = [];
    var onInput = false;
    var row = document.createElement('div');
    row.classList.add('row');
    if (torrentType.season) {
        size = 2;
        if (torrentSeason === '') {
            if (torrentEpisode !== '') {
                classes = ['error'];
            } else {
                classes = ['warning'];
            }
        }
        onInput = function () {
            const torrentSeason = formatEpisodeSeason(this.value);
            const torrentEpisode = formatEpisodeSeason(document.querySelector('form[name="form_info"] input[name="episode"]').value);
            this.value = torrentSeason;
            if (torrentSeason === '') {
                if (torrentEpisode !== '') {
                    this.classList.add('error');
                    this.classList.remove('warning');
                } else {
                    this.classList.add('warning');
                    this.classList.remove('error');
                }
            } else {
                this.classList.remove('warning');
                this.classList.remove('error');
            }
        };
        row.appendChild(getInputCol("Saison", 'season', classes, 'number', torrentSeason, {size: size, attrs: {'min': '0'}, onInput: onInput}));
        classes = [];
        onInput = false;

        if (torrentEpisode === '') {
            classes = ['warning'];
        }
        onInput = function () {
            const torrentEpisode = formatEpisodeSeason(this.value);
            this.value = torrentEpisode;
            if (torrentEpisode === '') {
                this.classList.add('warning');
            } else {
                this.classList.remove('warning');
            }
            document.querySelector('form[name="form_info"] input[name="season"]').dispatchEvent(new Event('input', {
                bubbles: true,
                cancelable: true,
            }));
        };
        row.appendChild(getInputCol("Episode", 'episode', classes, 'number', torrentEpisode, {size: size, attrs: {'min': '0'}, onInput: onInput}));
        classes = [];
        onInput = false;

        var space = document.createElement('div');
        space.classList.add('col-1');
        row.appendChild(space);
        row.appendChild(getInputCol("ID", 'id', [], 'text', torrentId, {size: size}));
        row.appendChild(space.cloneNode());
    } else {
        row.appendChild(getInputCol("ID", 'id', [], 'text', torrentId, {size: size}));
        row.appendChild(getInputCol("Year", 'year', ['warning'], 'text', torrentYear, {size: size,
                onInput: function () {
                    if (this.value.length !== 4) {
                        this.classList.remove('warning');
                        this.classList += ' error';
                    } else {
                        this.classList.remove('error');
                        this.classList.remove('warning');
                    }
                }
            })
        );
    }

    row.appendChild(getInputCol("Quality", 'quality', [], 'text', torrentQuality, {size: size}));

    onInput = function () {
        const torrentType = getTypeFromName(categories, this.options[this.selectedIndex].value);
        if (torrentType.name === 'unknown') {
            this.classList.add('error');
        } else {
            this.classList.remove('error');
            row.replaceWith(getSecondRow(torrentType, torrentSeason, torrentEpisode, torrentId, torrentYear, torrentQuality, categories));
        }
    };
    var categoriesNameList = categories.map(x => x.name);
    if (torrentType.name === 'unknown') {
        classes = ['error'];
        categoriesNameList.push('unknown');
    }
    row.appendChild(getSelectCol('Types', 'type', classes, categoriesNameList, torrentType.name, {size: size, onInput: onInput}));
    classes = [];
    onInput = false;

    return row;
}


/*********/
/* Utils */
/*********/

/* Ensure the episode and season number is nice */
function formatEpisodeSeason(value) {
    if (value > 0 && value <= 9) {
        if (value.includes('0')) {
            value = `${parseInt(value)}`;
        }
        value = `0${value}`;
    } else {
        while (value.substring(0, 1) === '0') {
            value = value.substring(1, value.length);
        }
    }
    return value;
}

function getTypeFromUrl(categories) {
    for (var i in categories) {
        var urls = categories[i].urls;
        for (var j in urls) {
            if (path.indexOf(urls[j]) !== -1) {
                return categories[i];
            }
        }
    }
    return {
        name: 'unknown',
        season: false,
        urls: ['/']
    };
}

function getTypeFromName(categories, name) {
    for (var i in categories) {
        if (categories[i].name === name) {
                return categories[i];
        }
    }
    return {
        name: 'unknown',
        season: false,
        urls: ['/']
    };
}
