

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;


window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;


window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

if (!window.indexedDB) {
    alert("Your browser is not supported indexDB");
}

var db;
// version number = 1
var request = window.indexedDB.open("db_gpx", 1);

request.onerror = function (event) {
    console.log("error" + event.target.result)
}

request.onsuccess = function (event) {
    db = request.result;
    console.log("success " + db)
}

request.onupgradeneeded = function (event) {

    var db  = event.target.result;

    var objectStore = db.createObjectStore("db_gpx", { keyPath: "id", autoIncrement:true })

}