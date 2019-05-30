var defaults = {
    defaultCategories: [{
        name: "tv_show",
        season: true,
        urls: ["/filmvid%C3%A9o/s%C3%A9rie-tv/", "/filmvideo/serie-tv/"],
    }, {
        name: "anime",
        season: true,
        urls: ["/filmvid%C3%A9o/animation-s%C3%A9rie/", "/film-video/animation-serie/"],
    }, {
        name: "movie",
        season: false,
        urls: [
            "/filmvid%C3%A9o/film/",
            "/filmvideo/film/",
            "/filmvid%C3%A9o/animation/",
            "/filmvideo/animation/"
        ],
    }],
    defaultSearchSort: 'publish_date',
    defaultSearchOrder: 'desc',
    storageSchema: 1 // Increment this when data format changes
};

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason === "install"){
        chrome.storage.sync.set(defaults);
        chrome.storage.sync.set({ 'categories': defaults.defaultCategories});
        chrome.storage.sync.set({ 'searchSort': defaults.defaultSearchSort});
        chrome.storage.sync.set({ 'searchOrder': defaults.defaultSearchOrder});
    } else if(details.reason === "update"){
        migrateData();
    }
});

function migrateData() {
    // Handle migration from 1.0-1.1 to 1.2
    chrome.storage.sync.get('storageSchema', function (data) {
        if (!data) {
            chrome.storage.sync.set({ 'searchSort': defaults.defaultSearchSort});
            chrome.storage.sync.set({ 'searchOrder': defaults.defaultSearchOrder});
        }
    });
    // This pulls stored values, falling back to defaults, if none
    chrome.storage.sync.get(defaults, function (data) {
        var migrated = false;
        while (!migrated) {
            switch (data.storageSchema) {
                // case 1:
                //     /* modify data to migrate from 1.0-1.2 to 1.3 */
                //     data.storageSchema = 2;
                //     break;
                case defaults.storageSchema: // Expected; we're done migrating
                    migrated = true;
                    break;
                default:
                    throw new Error(`Unrecognized storage schema ${data.storageSchema}!`);
            }
        }
        chrome.storage.sync.set(defaults);
    });
}
