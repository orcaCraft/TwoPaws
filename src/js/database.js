
// ==========================================
// TwoPaws - IndexedDB Database
// ==========================================

const DB_NAME = "TwoPawsDB";
const DB_VERSION = 1;

let dbInstance = null;


// Open or create the database
function openDatabase() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Create database stores if they don't exist
        request.onupgradeneeded = (event) => {

            const db = event.target.result;

            if (!db.objectStoreNames.contains("datePlans")) {
                db.createObjectStore("datePlans", {
                    keyPath: "id"
                });
            }

            if (!db.objectStoreNames.contains("activities")) {
                db.createObjectStore("activities", {
                    keyPath: "id"
                });
            }
        };

        request.onsuccess = (event) => {

            dbInstance = event.target.result;

            resolve(dbInstance);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };

    });
}


// Retrieve all records from a store
function getAllRecords(storeName) {

    return new Promise((resolve, reject) => {

        const transaction = dbInstance.transaction(
            storeName,
            "readonly"
        );

        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };

    });
}


// Add or update a record
function saveRecord(storeName, record) {

    return new Promise((resolve, reject) => {

        const transaction = dbInstance.transaction(
            storeName,
            "readwrite"
        );

        const store = transaction.objectStore(storeName);
        const request = store.put(record);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };

    });
}


// Delete a record
function deleteRecord(storeName, id) {

    return new Promise((resolve, reject) => {

        const transaction = dbInstance.transaction(
            storeName,
            "readwrite"
        );

        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };

    });
}
