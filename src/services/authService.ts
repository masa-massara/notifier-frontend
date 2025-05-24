// src/services/authService.ts
import { auth } from "@/lib/firebase";
// currentUserAtom, idTokenAtom, store のインポートを削除します
import {
	EmailAuthProvider,
	type User,
	createUserWithEmailAndPassword,
	// onAuthStateChanged, // ここでは不要になる可能性が高いです
	reauthenticateWithCredential,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signOut,
	updatePassword,
} from "firebase/auth";

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
		// Jotai atomの更新処理は削除します (AuthStateSynchronizerが担当します)
		return userCredential;
	} catch (error) {
		console.error("Error signing up:", error);
		throw error;
	}
};

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
		// Jotai atomの更新処理は削除します
		return userCredential;
	} catch (error) {
		console.error("Error signing in:", error);
		throw error;
	}
};

export const signOutUser = async () => {
	try {
		await signOut(auth);
		// Jotai atomの更新処理は削除します
	} catch (error) {
		console.error("Error signing out:", error);
		throw error;
	}
};

// sendPasswordReset と updateUserPassword はJotaiの認証atomを直接操作しないため、そのままで問題ありません
export const sendPasswordReset = async (email: string) => {
	try {
		await sendPasswordResetEmail(auth, email);
	} catch (error) {
		console.error("Error sending password reset email:", error);
		throw error;
	}
};

export const updateUserPassword = async (
	currentPassword_provided: string,
	newPassword_provided: string,
) => {
	const user = auth.currentUser;
	if (!user || !user.email) {
		throw new Error("User not authenticated or email not available.");
	}
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

// 以前の onAuthStateChangedListener は AuthStateSynchronizer に役割が移行したため、
// このファイルからは削除するか、他の目的で使用している場合はJotai関連の処理のみ削除してください。
/*
export const onAuthStateChangedListener = (
	callback?: (user: User | null) => void,
) => {
	return onAuthStateChanged(auth, async (user) => {
		// Jotaiの更新処理は削除します
		if (callback) {
			callback(user);
		}
	});
};
*/
