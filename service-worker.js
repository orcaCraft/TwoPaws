
// ==========================================
// TwoPaws - Service Worker
// ==========================================

const CACHE_NAME = "twopaws-cache-v2";

// Files required for the application shell
const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./src/css/style.css",
    "./src/js/database.js",
    "./src/js/app.js",
    "./public/icons/icon-192.png",
    "./public/icons/icon-512.png"
];


// ==========================================
// Install - Cache application files
// ==========================================

self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(APP_FILES);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );

});


// ==========================================
// Activate - Remove old caches
// ==========================================

self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {

                return Promise.all(
                    cacheNames
                        .filter(name => name.startsWith("twopaws-cache-") && name !== CACHE_NAME)
                        .map(name => caches.delete(name))
                );

            })
            .then(() => self.clients.claim())
    );

});


// ==========================================
// Fetch - Serve cached application files
// ==========================================

self.addEventListener("fetch", event => {

    const request = event.request;

    // Only handle requests from this application
    if (new URL(request.url).origin !== self.location.origin) {
        return;
    }

    // Handle page navigation
    if (request.mode === "navigate") {

        event.respondWith(
            fetch(request)
                .then(response => {

                    if (response.ok) {
                        const responseCopy = response.clone();

                        caches.open(CACHE_NAME).then(cache => {
                            cache.put("./index.html", responseCopy);
                        });
                    }

                    return response;

                })
                .catch(() => {
                    return caches.match("./index.html");
                })
        );

        return;
    }

    // Handle other application files
    event.respondWith(
        fetch(request)
            .then(response => {

                if (response.ok) {
                    const responseCopy = response.clone();

                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseCopy);
                    });
                }

                return response;

            })
            .catch(() => {
                return caches.match(request);
            })
    );

});
