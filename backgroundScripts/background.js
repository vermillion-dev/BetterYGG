var categories = [{
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
    },
];

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        chrome.storage.sync.set({ 'defaultCategories': categories});
        chrome.storage.sync.set({ 'categories': categories});
    }
    if(details.reason == "update"){
        chrome.storage.sync.set({ 'defaultCategories': categories});
    }
});