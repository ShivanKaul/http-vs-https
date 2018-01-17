'use strict';

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

function display() {
    restoreLocalStorage()
        .then(storage => {
            let http_percent = " (" + (((storage.total-storage.httpses)/storage.total) * 100) + "%)";
            let https_percent = " (" + ((storage.httpses/storage.total) * 100) + "%)";
            if (storage.total == 0) {
                // Don't want to display NaNs!
                http_percent = "";
                https_percent = "";
            }
            document.getElementById('time').textContent = storage.time;
            document.getElementById('http_%').textContent = storage.total - storage.httpses + " / " + storage.total + http_percent;
            document.getElementById('https_%').textContent = storage.httpses + " / " + storage.total + https_percent;
        })
        .catch(err => console.error(err));
}

document.addEventListener('DOMContentLoaded', display);

