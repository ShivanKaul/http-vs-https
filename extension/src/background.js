'use strict';

var DEV = false;

function restoreLocalStorage() {
    return new Promise(function (resolve, reject) {
        chrome.storage.sync.get({
            websites: {}, // default
            httpses: 0, // default
            total: 0,
            time: 0
        }, function(storage) {
            if (storage) resolve(storage);
            else reject("Failed to retrieve storage from Chrome");
        });
    });
}


// Citation: https://developer.chrome.com/extensions/optionsV2
// Saves options to chrome.storage.sync.
function saveToLocalStorage(websites, httpses, total) {
    chrome.storage.sync.set({
        websites: websites,
        httpses: httpses,
        total: total
    }, function() {
        DEV && console.debug("[http-vs-https]: Saved options");
    });
}

function check(curUrl) {
    const url = new URL(curUrl);
    const domain = url.hostname;
    const protocol = url.protocol;
    if (!protocol.includes('http')) return;
    /* Use this as key for websites dictionary because we want to distinguish
     * between https and http versions of the same website. 
     */
    const website = protocol + '//' + domain;
    restoreLocalStorage()
        .then(storage => {
            DEV && console.debug(storage);
            if (!(website in storage.websites)) {
                // does not already exist
                storage.total += 1;
                if (protocol == 'https:') {
                    storage.httpses += 1;
                    storage.websites[website] = 'https';
                } else {
                    storage.websites[website] = 'http';
                }
            }
            // store
            saveToLocalStorage(storage.websites, storage.httpses, storage.total);
        });
}


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url) check(changeInfo.url);
});

/* Check whether new version is installed */
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
        /* If first install, get time and save */
        const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: "short"};
        /* undefined first argument because we want to use runtime's default locale 
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
         */
        const time = (new Date()).toLocaleDateString(undefined, options);
        chrome.storage.sync.set({
            time: time
        }, function() {
            DEV && console.debug("[http-vs-https]: Saved time as " + time);
        });
    }
});
