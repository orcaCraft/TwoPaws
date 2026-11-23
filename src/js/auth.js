import {
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

const { auth, googleProvider } = window.twoPawsFirebase;

// Request permission to access files created by or explicitly
// selected for TwoPaws in Google Drive.
googleProvider.addScope(
    "https://www.googleapis.com/auth/drive.file"
);

// Sign in with Google
async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);

        // Obtain the Google OAuth access token for Drive API calls.
        const credential =
            GoogleAuthProvider.credentialFromResult(result);

        const accessToken = credential?.accessToken;

        console.log("TwoPaws Google sign-in successful!");
        console.log("Signed in as:", result.user.email);

        return {
            user: result.user,
            accessToken
        };

    } catch (error) {
        console.error("Google sign-in failed:", error);
        throw error;
    }
}

// Sign out
async function signOutUser() {
    try {
        await signOut(auth);
        console.log("TwoPaws user signed out.");
    } catch (error) {
        console.error("Sign-out failed:", error);
        throw error;
    }
}

// Listen for authentication changes
function listenToAuthChanges(callback) {
    return onAuthStateChanged(auth, callback);
}

// Make authentication functions available to the app
window.twoPawsAuth = {
    signInWithGoogle,
    signOutUser,
    listenToAuthChanges
};

console.log("TwoPaws authentication module loaded!");
