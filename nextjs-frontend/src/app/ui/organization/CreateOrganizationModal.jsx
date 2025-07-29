'use client'

import React, { useState } from 'react';

const CreateOrganizationModal = ({ isOpen, onClose, onCreate }) => {

    const [formData, setFormData] = useState({ name: '', bio: '' });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      organizationName: formData.name,
      bio: formData.bio,
    });
    setFormData({ name: '', bio: '' });
    onClose();
  };

  if (!isOpen) return null;
    
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Organization</h2>
              <p className="text-gray-600 mb-6">Set up a new organization to collaborate with others</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Acme Inc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="What's this organization about?"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onClose()}
                    className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                  >
                    Create Organization
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
  )
}

export default CreateOrganizationModal
