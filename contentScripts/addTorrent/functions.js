/*************/
/* FUNCTIONS */
/*************/

function alert(id){
    document.querySelectorAll('.alert').forEach(function(elem){
        elem.style.display = "none";
    });
    document.getElementById(id).style.display = "block";
}

function showAlert(id){
    if (document.readyState !== "complete"){
        document.addEventListener('readystatechange', function onReadyStateChange() {
            alert(id);
        }, false);
    } else {
        alert(id);
    }
}

function addToDiscord() {
    if(discordWebhookUrl === undefined){
        showAlert('error_discord_button_alert')
        return;
    }

    var inputs = document.forms['form_info'].querySelectorAll('input, select');
    var dict = {}

    for(var i = 0; i < inputs.length; i++){
        input = inputs[i]
        if(!input){
            continue;
        }
        if(input.className.includes('error')){
            showAlert('error_form_alert');
            return;
        }
        dict[input.name] = input.value;
    }

    data = {
        content: JSON.stringify(dict),
        username: discordUserName,
    }

    xhr = new XMLHttpRequest();
    xhr.open('POST', discordWebhookUrl);
    xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    xhr.onload = function() {
        if (xhr.status === 204) {
           showAlert('valid_form_alert');
        }
        else{
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
    inputNode.className = "form-control " + classes.join(" ");
    inputNode.setAttribute("type", type);
    for (var key in attrs) {
        inputNode.setAttribute(key, attrs[key]);
    }
    inputNode.value = value;
    return inputNode;
}

function getSelect(name, classes, options, selected, attrs = {}){
    var selectNode = document.createElement('select');
    selectNode.name = name;
    selectNode.className = "form-control " + classes.join(" ");
    for (var key in attrs) {
        selectNode.setAttribute(key, attrs[key]);
    }
    for (var index in options){
        var type = options[index];
        var option = document.createElement("option");
        option.value = type;
        option.text = type;
        if (type === selected)
            option.setAttribute("selected", "selected");
        selectNode.appendChild(option);
    }
    return selectNode;
}

function getFormGroup(input, label, name, size) {
    var labelNode = document.createElement('label');
    labelNode.className = "control-label";
    labelNode.setAttribute("for", name);
    labelNode.appendChild(document.createTextNode(label));

    var div = document.createElement('div');
    div.className = "form-group col-" + size;
    div.appendChild(labelNode);
    div.appendChild(input);
    return div;
}

function getInputCol(label, name, classes, type, value, { size = 12, attrs = {}, onInput = false }){
    var input = getInput(name, classes, type, value, attrs);
    if(onInput){
        input.addEventListener("input", onInput);
    }
    return getFormGroup(input, label, name, size);
}

function getSelectCol(label, name, classes, options, selected, { size = 12, attrs = {}, onInput = false }){
    var select = getSelect(name, classes, options, selected, attrs);
    if(onInput){
        select.addEventListener("input", onInput);
    }
    return getFormGroup(select, label, name, size);
}

function getSecondRow(torrentType, torrentSeason, torrentEpisode, torrentId, torrentYear, torrentQuality, categories){
    var size = 3;
    var classes = [];
    var onInput = false;
    var row = document.createElement('div');
    row.className = "row";
    if(torrentType.season){
        size = 2;
        if(torrentSeason == ''){
            classes = ['error'];
        }
        onInput = function() {
            torrentSeason = formatEpisodeSeason(this.value);
            this.value = torrentSeason;
            if(torrentSeason === "")
                this.className += ' error';
            else
                this.classList.remove('error');
        }
        row.appendChild(getInputCol("Saison", "season", classes, "number", torrentSeason, { size:size, attrs:{"min": "0"}, onInput:onInput }));
        classes = [];
        onInput = false;

        if(torrentEpisode == ''){
            classes = ['warning'];
        }
        onInput = function() {
            torrentEpisode = formatEpisodeSeason(this.value);
            this.value = torrentEpisode;
            if(torrentEpisode === "")
                this.className += ' warning';
            else
                this.classList.remove('warning');
        }
        row.appendChild(getInputCol("Episode", "episode", classes, "number", torrentEpisode,{ size:size, attrs:{"min": "0"}, onInput:onInput }));
        classes = [];
        onInput = false;

        var space = document.createElement('div');
        space.className = 'col-1';
        row.appendChild(space);
        row.appendChild(getInputCol("ID", "id", [], "text", torrentId, { size:size }));
        row.appendChild(space.cloneNode());
    }
    else{
        row.appendChild(getInputCol("ID", "id", [], "text", torrentId, { size:size }));
        row.appendChild(getInputCol("Year", "year", ['warning'], "text", torrentYear, { size:size,
                onInput:function() {
                    if(this.value.length != 4){
                        this.classList.remove('warning')
                        this.classList += ' error'
                    }
                    else{
                        this.classList.remove('error')
                        this.classList.remove('warning')
                    }
                }
            })
        );
    }

    row.appendChild(getInputCol("Quality", "quality", [], "text", torrentQuality, { size:size }));

    onInput = function() {
        torrentType = getTypeFromName(categories, this.options[this.selectedIndex].value)
        if(torrentType.name === 'unknown'){
            this.className += ' error';
        }
        else{
            this.classList.remove('error');
            row.replaceWith(getSecondRow(torrentType, torrentSeason, torrentEpisode, torrentId, torrentYear, torrentQuality, categories))
        }
    }
    categoriesNameList = categories.map(x => x.name);
    if(torrentType.name === 'unknown'){
        classes = ['error'];
        categoriesNameList.push('unknown');
    }
    row.appendChild(getSelectCol('Types', 'type', classes, categoriesNameList, torrentType.name, { size:size, onInput:onInput }));
    classes = []
    onInput = false;

    return row
}


/*********/
/* Utils */
/*********/

/* Ensure the episode and season number is nice */
function formatEpisodeSeason(value){
    if(value > 0 && value <= 9){
        if(value.includes("0")){
            value = "" + parseInt(value);
        }
        value = "0" + value;
    }
    else{
        while(value.substring(0,1) === "0"){
            value = value.substring(1, value.length);
        }
    }
    return value;
}

function getTypeFromUrl(categories) {
    for (var i in categories) {
        var urls = categories[i].urls
        for(var j in urls){
            if(path.indexOf(urls[j]) != -1){
                return categories[i];
            }
        }
    }
    return {
        name: "unknown",
        season: false,
        urls: ["/"]
    };
};

function getTypeFromName(categories, name) {
    for (var i in categories) {
        if (categories[i].name === name){
                return categories[i];
        }
    }
    return {
        name: "unknown",
        season: false,
        urls: ["/"]
    };
};