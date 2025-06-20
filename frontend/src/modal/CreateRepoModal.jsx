import React, { useState } from "react";

export default function CreateRepoModal({ isOpen, onClose, onCreate }) {
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      name: repoName,
      description:description,
      private: isPrivate,
    });
    setRepoName("");
    setDescription("");
    setIsPrivate(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Create New Repository
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
  
        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Repository Name</label>
            <div className="relative">
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`relative p-4 border rounded-lg cursor-pointer transition-all ${!isPrivate ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                <input
                  type="radio"
                  value={false}
                  checked={!isPrivate}
                  onChange={() => setIsPrivate(false)}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${!isPrivate ? 'border-blue-500' : 'border-gray-400'}`}>
                    {!isPrivate && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                  </div>
                  <div>
                    <span className="block font-medium">Public</span>
                    <span className="block text-sm text-gray-500">Visible to everyone</span>
                  </div>
                </div>
              </label>
  
              <label className={`relative p-4 border rounded-lg cursor-pointer transition-all ${isPrivate ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                <input
                  type="radio"
                  value={true}
                  checked={isPrivate}
                  onChange={() => setIsPrivate(true)}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isPrivate ? 'border-blue-500' : 'border-gray-400'}`}>
                    {isPrivate && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                  </div>
                  <div>
                    <span className="block font-medium">Private</span>
                    <span className="block text-sm text-gray-500">Only visible to you</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
  
          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="px-5 py-2.5 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-md hover:shadow-lg"
            >
              Create Repository
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
