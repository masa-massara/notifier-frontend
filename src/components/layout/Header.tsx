"use client";

import Link from "next/link";
import { useAtomValue } from "jotai";
import { currentUserAtom } from "@/store/globalAtoms";
import { Button } from "@/components/ui/button"; // Assuming Button component is available

interface HeaderProps {
  appName: string;
  appIcon: React.ReactNode;
  loginButtonText: string;
  signupButtonText: string;
  defaultUserName: string;
}

export default function Header(props: HeaderProps) {
  const currentUser = useAtomValue(currentUserAtom);

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="flex items-center space-x-2">
        {props.appIcon}
        <span className="font-semibold">{props.appName}</span>
      </Link>
      <div className="flex items-center space-x-2">
        {currentUser ? (
          <>
            <span>{currentUser.email || props.defaultUserName}</span>
            <Link href="/account/settings">
              <Button variant="outline" size="icon">
                ⚙️ {/* Gear Icon */}
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="outline">{props.loginButtonText}</Button>
            </Link>
            <Link href="/signup">
              <Button>{props.signupButtonText}</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
