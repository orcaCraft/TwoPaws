
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

// Common helper for Google Drive API requests
async function driveRequest(url, accessToken, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            ...options.headers
        }
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));

        throw new Error(
            `Google Drive API error (${response.status}): ${
                error.error?.message || response.statusText
            }`
        );
    }

    return response;
}

// Find the TwoPaws data file
async function findDataFile(accessToken) {
    const params = new URLSearchParams({
        q: "name = 'twopaws_data.json' and trashed = false",
        fields: "files(id, name, mimeType, modifiedTime)",
        spaces: "drive"
    });

    const response = await driveRequest(
        `${DRIVE_API}/files?${params}`,
        accessToken
    );

    const result = await response.json();

    return result.files?.[0] || null;
}

// Create the TwoPaws data file
async function createDataFile(accessToken, initialData) {
    const response = await driveRequest(
        `${DRIVE_API}/files`,
        accessToken,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: "twopaws_data.json",
                mimeType: "application/json"
            })
        }
    );

    const file = await response.json();

    await driveRequest(
        `${DRIVE_UPLOAD_API}/files/${file.id}?uploadType=media`,
        accessToken,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(initialData)
        }
    );

    return file;
}

// Download the contents of a TwoPaws data file
async function downloadDataFile(accessToken, fileId) {
    const response = await driveRequest(
        `${DRIVE_API}/files/${fileId}?alt=media`,
        accessToken
    );

    return await response.json();
}

// Update the contents of a TwoPaws data file
async function updateDataFile(accessToken, fileId, data) {
    const response = await driveRequest(
        `${DRIVE_UPLOAD_API}/files/${fileId}?uploadType=media`,
        accessToken,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );

    return response;
}

// Make Drive functions accessible to TwoPaws
window.twoPawsDrive = {
    findDataFile,
    createDataFile,
    downloadDataFile,
    updateDataFile
};

console.log("TwoPaws Google Drive module loaded!");
