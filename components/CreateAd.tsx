import React, { useState } from 'react';
import type { View } from '../types';
import { createAd } from '../services/apiService';
import { generateAdDescription } from '../services/geminiService';
import { VIEWS } from '../constants';

interface CreateAdProps {
    setActiveView: (view: View) => void;
}

const CreateAd: React.FC<CreateAdProps> = ({ setActiveView }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleGenerateDescription = async () => {
    if (!title) {
        setError("Please enter a title first.");
        return;
    }
    setAiLoading(true);
    setError(null);
    try {
        const generatedDesc = await generateAdDescription(title);
        setDescription(generatedDesc);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate description.');
    } finally {
        setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !image) {
      setError('Please fill all fields and upload an image.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // FIX: Added missing 'listingType' property to satisfy the 'CreateAdData' type.
      await createAd({ title, description, price: parseFloat(price), image, listingType: 'buy-now' });
      alert('Ad created successfully!');
      setActiveView(VIEWS.MARKETPLACE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ad.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold mb-4 text-text-primary">Create New Ad</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-text-secondary">Ad Image</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border-color border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto rounded" />
              ) : (
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-secondary rounded-md font-medium text-accent hover:text-accent-hover focus-within:outline-none">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                </label>
                <p className="pl-1 text-text-secondary">or drag and drop</p>
              </div>
              <p className="text-xs text-text-secondary">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-secondary">Title</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full bg-secondary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
        </div>

        <div>
          <div className="flex justify-between items-center">
             <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Description</label>
             <button type="button" onClick={handleGenerateDescription} disabled={aiLoading} className="text-xs text-accent font-semibold disabled:opacity-50">
                {aiLoading ? 'Generating...' : 'Generate with AI ✨'}
             </button>
          </div>
          <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full bg-secondary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-text-secondary">Price</label>
          <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1 block w-full bg-secondary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" placeholder="0.00" />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-hover disabled:bg-gray-500">
          {loading ? 'Posting...' : 'Post Ad'}
        </button>
      </form>
    </div>
  );
};

export default CreateAd;