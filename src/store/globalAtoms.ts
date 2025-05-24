import { atom } from "jotai";
import { QueryClient } from "@tanstack/react-query";
import { queryClientAtom } from "jotai-tanstack-query";
import { User } from "firebase/auth"; // Assuming User type is imported from firebase/auth

// Atom for storing the current user object
export const currentUserAtom = atom<User | null>(null);

// Atom for storing the Firebase ID token
export const idTokenAtom = atom<string | null>(null);

// Atom for TanStack Query QueryClient
// This atom is exported directly from jotai-tanstack-query
// and initialized with a new QueryClient instance.
export const customQueryClientAtom = queryClientAtom(new QueryClient());
