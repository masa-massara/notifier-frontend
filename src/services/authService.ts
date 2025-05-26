import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	sendPasswordResetEmail,
	onAuthStateChanged,
	EmailAuthProvider,
	reauthenticateWithCredential,
	updatePassword,
	type User, // Import User type
} from "firebase/auth";
import { auth } from "@/lib/firebase"; // Assuming auth is exported from firebase.ts
import { currentUserAtom, idTokenAtom } from "../store/globalAtoms";
import { store } from "@/store/store"; // Assuming your Jotai store instance is exported as 'store'

/**
 * Signs up a new user with email and password.
 */
export const signUpWithEmailPassword = async (
	email: string,
	password: string,
) => {
	try {
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password,
		);
		const user = userCredential.user;
		const idToken = await user.getIdToken();
		// store.set(currentUserAtom, user); // Removed
		// store.set(idTokenAtom, idToken); // Removed
		return { user, idToken };
	} catch (error) {
		console.error("Error signing up:", error);
		throw error; // Re-throw to be caught by the calling UI
	}
};

/**
 * Signs in an existing user with email and password.
 */
export const signInWithEmailPassword = async (
	email: string,
	password: string,
) => {
	try {
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password,
		);
		const user = userCredential.user;
		const idToken = await user.getIdToken();
		// store.set(currentUserAtom, user); // Removed
		// store.set(idTokenAtom, idToken); // Removed
		return { user, idToken };
	} catch (error) {
		console.error("Error signing in:", error);
		throw error;
	}
};

/**
 * Signs out the current user.
 */
export const signOutUser = async () => {
	try {
		await signOut(auth);
		// store.set(currentUserAtom, null); // Removed
		// store.set(idTokenAtom, null); // Removed
	} catch (error) {
		console.error("Error signing out:", error);
		throw error;
	}
};

/**
 * Sends a password reset email to the given email address.
 */
export const sendPasswordReset = async (email: string) => {
	try {
		await sendPasswordResetEmail(auth, email);
	} catch (error) {
		console.error("Error sending password reset email:", error);
		throw error;
	}
};

/**
 * Updates the current user's password.
 * Requires re-authentication.
 */
export const updateUserPassword = async (
	currentPassword_provided: string,
	newPassword_provided: string,
) => {
	const user = auth.currentUser;
	if (!user || !user.email) {
		throw new Error("User not authenticated or email not available.");
	}

	// Typescript workaround: firebase user.email can be null
	const email = user.email;

	try {
		const credential = EmailAuthProvider.credential(
			email,
			currentPassword_provided,
		);
		await reauthenticateWithCredential(user, credential);
		await updatePassword(user, newPassword_provided);
	} catch (error) {
		console.error("Error updating password:", error);
		throw error;
	}
};

/**
 * Sets up an observer for changes to the user's sign-in state.
 * Updates Jotai atoms (currentUserAtom, idTokenAtom) accordingly.
 *
 * @param callback - An optional callback function that receives the User object.
 *                   It's called whenever the auth state changes.
 * @returns An unsubscribe function from Firebase's onAuthStateChanged.
 */
export const onAuthStateChangedListener = (
	callback?: (user: User | null) => void,
) => {
	return onAuthStateChanged(auth, async (user) => {
		if (user) {
			store.set(currentUserAtom, user);
			const idToken = await user.getIdToken();
			store.set(idTokenAtom, idToken);
		} else {
			store.set(currentUserAtom, null);
			store.set(idTokenAtom, null);
		}
		if (callback) {
			callback(user);
		}
	});
};
