import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

const SignOut = () => {
    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div>
            <button onClick={handleSignOut}>Sign Out</button>
        </div>
    );
};

export default SignOut;