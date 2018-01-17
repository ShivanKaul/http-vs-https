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

function format_decimal(num) {
   return Math.round(num).toFixed(1);
}

function display() {
    restoreLocalStorage()
        .then(storage => {
            let http_percent_str = "";
            let https_percent_str = "";
            if (storage.total != 0) {
                // Don't want to display NaNs!
                let http_percent = format_decimal(((((storage.total-storage.httpses)/storage.total) * 100)));
                let https_percent = format_decimal((((storage.httpses/storage.total) * 100)));
                http_percent_str = " (" + http_percent + "%)";
                https_percent_str = " (" + https_percent + "%)";
                DEV && console.debug(http_percent_str);
                DEV && console.debug(https_percent_str);
            }
            document.getElementById('time').textContent = storage.time;
            document.getElementById('http_%').textContent = storage.total - storage.httpses + " / " + storage.total + http_percent_str;
            document.getElementById('https_%').textContent = storage.httpses + " / " + storage.total + https_percent_str;
        })
        .catch(err => console.error(err));
}

document.addEventListener('DOMContentLoaded', display);

