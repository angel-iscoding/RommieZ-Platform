function setStorage (object) {
    for (const key in object) {
        localStorage.setItem(key, object[key]);
    }
}

function getItems (keys) {
    return keys.map(value => localStorage.getItem(value));
}

function getItem (key) {
    return localStorage.getItem(key);
}

function clear() {
    localStorage.clear();
}


export default { setStorage, getItems, getItem, clear}; 