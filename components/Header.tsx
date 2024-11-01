import React from "react";

function Header({ onLogout, loggedIn }: { onLogout: () => void, loggedIn: boolean }) {
    return (
        <header className="flex justify-between items-center py-4 border-b">
            <h1 className="text-2xl font-bold">Albert Heijn Receipts Viewer</h1>
            {loggedIn && (
            <button 
                onClick={onLogout} 
                className="px-4 py-2 bg-red-500 text-white rounded"
            >
                Log Out
            </button>
            )}
        </header>
    );
}

export default Header;