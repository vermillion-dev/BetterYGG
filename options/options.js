var storedValues = [
    'yggToken',
    'discordWebhookUrl',
    'discordUserName',
    'displayDiscord',
    'displayAddCategories',
    'defaultCategories',
    'categories',
    'searchSort',
    'searchOrder'
];

var yggToken = document.getElementById('yggToken');
var discordWebhookUrl = document.getElementById('discordWebhookUrl');
var discordUserName = document.getElementById('discordUserName');
var displayDiscord = document.getElementById('displayDiscord');
var displayAddCategories = document.getElementById('displayAddCategories');

var discordIntegration = document.getElementById('discordIntegrationSection');
var displayAddCategoriesSection = document.getElementById('displayAddCategoriesSection');
var addCategories = document.getElementById('addCategoriesSection');

var categoriesTable = document.getElementById('categoriesTable').children[1];
var buttonSaveCategories = document.getElementById('saveCategories');
var buttonRestoreCategories = document.getElementById('restoreCategories');
var defaultCategories = [];
var categories = [];

var searchSort = document.getElementById('searchSort');
var searchOrder = document.getElementById('searchOrder');

chrome.storage.sync.get(storedValues, function (value) {
    if (value.yggToken) {
        yggToken.value = value.yggToken;
    }
    if (value.discordWebhookUrl) {
        discordWebhookUrl.value = value.discordWebhookUrl;
    }
    if (value.discordUserName) {
        discordUserName.value = value.discordUserName;
    }
    if (value.displayDiscord) {
        displayDiscord.checked = value.displayDiscord;
        if (displayDiscord.checked) {
            discordIntegration.style.display = "block";
            displayAddCategoriesSection.style.display = "block";
            if (displayAddCategories.checked) {
                addCategories.style.display = "block";
            }
        } else {
            discordIntegration.style.display = "none";
            displayAddCategoriesSection.style.display = "none";
            addCategories.style.display = "none";
        }
        if (value.displayAddCategories) {
            displayAddCategories.checked = value.displayAddCategories;
            if (displayAddCategories.checked) {
                addCategories.style.display = "block";
            } else {
                addCategories.style.display = "none";
            }
        }
    }
    if (value.categories) {
        categories = value.categories;
        makeCategoriesTable(categories);
    }
    if (value.defaultCategories) {
        defaultCategories = value.defaultCategories;
        buttonSaveCategories.addEventListener('click', saveCategories);
        buttonRestoreCategories.addEventListener('click', restoreDefaultCategories);
    }
    if (value.searchSort) {
        document.querySelector('#searchSort option[value=' + value.searchSort + ']').selected = "selected";
    }
    if (value.searchOrder) {
        document.querySelector('#searchOrder option[value=' + value.searchOrder + ']').selected = "selected";
    }
});

function addToStorage(name, value) {
    chrome.storage.sync.set({[name]: value});
}

document.addEventListener('DOMContentLoaded', function () {
    yggToken.addEventListener('input', function () {
        addToStorage('yggToken', this.value);
    });
    discordWebhookUrl.addEventListener('input', function () {
        addToStorage('discordWebhookUrl', this.value);
    });
    discordUserName.addEventListener('input', function () {
        addToStorage('discordUserName', this.value);
    });
    displayDiscord.addEventListener('input', function () {
        addToStorage('displayDiscord', this.checked);
        if (this.checked) {
            discordIntegration.style.display = "block";
            displayAddCategoriesSection.style.display = "block";
            if (displayAddCategories.checked) {
                addCategories.style.display = "block";
            }
        } else {
            discordIntegration.style.display = "none";
            displayAddCategoriesSection.style.display = "none";
            addCategories.style.display = "none";
        }
    });
    displayAddCategories.addEventListener('input', function () {
        addToStorage('displayAddCategories', this.checked);
        if (this.checked) {
            addCategories.style.display = "block";
        } else {
            addCategories.style.display = "none";
        }
    });
    searchSort.addEventListener('change', function () {
        addToStorage('searchSort', this.options[this.selectedIndex].value);
    });
    searchOrder.addEventListener('change', function () {
        addToStorage('searchOrder', this.options[this.selectedIndex].value);
    });
});

/***********************/
/* Element constructor */
/***********************/

function makeCategoriesArray() {
    var lines = Array.from(categoriesTable.children);
    var categoriesArray = [];
    for (var i in lines) {
        var line = lines[i];
        var name = line.getElementsByTagName('input').namedItem('name').value;
        var season = line.getElementsByTagName('input').namedItem('season').checked;
        var urls = line.getElementsByTagName('textarea').namedItem('urls').value;
        var urlsArray = urls.split('\n').filter(x => x !== '');
        if (name !== '') {
            categoriesArray.push({
                name: name,
                season: season,
                urls: urlsArray
            });
        }
    }
    return categoriesArray;
}

function makeCategoriesTable(categories) {
    var tbody = document.createElement('tbody');
    for (var i in categories) {
        var line = categories[i];
        var tr = getTr(line.name, line.season, line.urls, "Supprimer", deleteLine);
        tbody.appendChild(tr);
    }
    tr = getTr('', false, [], "Ajouter", addLine);
    tbody.appendChild(tr);
    categoriesTable.parentNode.replaceChild(tbody, categoriesTable);
    categoriesTable = tbody;
}

function getTr(name, season, urls, buttonText, buttonOnClick) {
    var tr = document.createElement('tr');

    var tdName = document.createElement('td');
    var inputName = document.createElement('input');
    inputName.type = "text";
    inputName.name = "name";
    inputName.value = name;
    tdName.appendChild(inputName);
    tr.appendChild(tdName);

    var tdSeason = document.createElement('td');
    var inputSeason = document.createElement('input');
    inputSeason.type = "checkbox";
    inputSeason.name = "season";
    inputSeason.checked = season;
    tdSeason.appendChild(inputSeason);
    tr.appendChild(tdSeason);

    var tdUrls = document.createElement('td');
    var textareaUrls = document.createElement('textarea');
    textareaUrls.name = "urls";
    textareaUrls.rows = "5";
    textareaUrls.cols = "75";
    textareaUrls.value = urls.join('\n');
    tdUrls.appendChild(textareaUrls);
    tr.appendChild(tdUrls);

    var tdTrash = document.createElement('td');
    var button = document.createElement('button');
    button.innerText = buttonText;
    button.addEventListener("click", buttonOnClick);
    tdTrash.appendChild(button);
    tr.appendChild(tdTrash);

    return tr;
}

/*******************/
/* Events Handlers */
/*******************/

function addLine() {
    this.innerText = "Supprimer";
    this.removeEventListener("click", addLine);
    this.addEventListener("click", deleteLine);
    var tr = getTr('', false, [], "Ajouter", addLine);
    categoriesTable.appendChild(tr);
}

function deleteLine() {
    this.parentElement.parentElement.remove();
}

function saveCategories() {
    categories = makeCategoriesArray();
    addToStorage('categories', categories);
    makeCategoriesTable(categories);
}

function restoreDefaultCategories() {
    categories = defaultCategories;
    addToStorage('categories', categories);
    makeCategoriesTable(categories);
}
