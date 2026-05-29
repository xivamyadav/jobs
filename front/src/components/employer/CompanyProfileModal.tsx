import React from 'react';

// Simplified fallback modal. 
export const CompanyProfileModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-[20px] p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Company Profile</h2>
                <p className="text-gray-500 mb-6">Profile updates can be managed from the main company page.</p>
                <button onClick={onClose} className="w-full py-2 bg-[#5B4DFF] text-white rounded-xl font-bold">
                    Close
                </button>
            </div>
        </div>
    );
};
