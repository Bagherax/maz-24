import React, { useState, useEffect, useRef } from 'react';
import type { View, ListingType, AuctionType, AdCondition, Media, MediaType } from '../../types';
import * as api from '../../api';
import { VIEWS } from '../../constants/views';
import { AIAnalysisProgress } from './AIAnalysisProgress';
import { useNotification } from '../../hooks/useNotification';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useAuth } from '../../context/AuthContext';
import Stepper from '../../components/ui/Stepper';
import CategorySelectorModal from './CategorySelectorModal';

import { XMarkIcon } from '../../components/icons/XMarkIcon';
import { RefreshIcon } from '../../components/icons/RefreshIcon';
import { BulletPointsIcon } from '../../components/icons/BulletPointsIcon';
import { ShortenIcon } from '../../components/icons/ShortenIcon';
import { SeoIcon } from '../../components/icons/SeoIcon';
import { VideoCameraIcon } from '../../components/icons/VideoCameraIcon';
import { DocumentTextIcon } from '../../components/icons/DocumentTextIcon';
import { LinkIcon } from '../../components/icons/LinkIcon';
import { PlayIcon } from '../../components/icons/PlayIcon';


interface CreateAdProps {
    setActiveView: (view: View, payload?: any) => void;
}

const STEPS = ['Upload', 'Details', 'Pricing', 'Description', 'Review'];

// Helper for YouTube URLs
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

const MediaPreview: React.FC<{ media: Media; onRemove: () => void; isFirst: boolean }> = ({ media, onRemove, isFirst }) => {
    const getIcon = () => {
        switch(media.type) {
            case 'video': return <VideoCameraIcon className="h-8 w-8 text-white" />;
            case 'pdf': return <DocumentTextIcon className="h-8 w-8 text-white" />;
            case 'youtube': return <PlayIcon className="h-8 w-8 text-white" />;
            default: return null;
        }
    };

    return (
        <div className="relative group aspect-square">
            <img src={media.thumbnailUrl || media.url} className="w-full h-full object-cover rounded-md bg-secondary" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                {getIcon()}
            </div>
            {isFirst && (
                <div className="absolute top-1 left-1 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">COVER</div>
            )}
            <button onClick={onRemove} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <XMarkIcon className="h-4 w-4"/>
            </button>
        </div>
    );
};

const CreateAd: React.FC<CreateAdProps> = ({ setActiveView }) => {
    const { identity, promptForIdentity } = useAuth();
    const { refreshMarketplaceData } = useMarketplace();
    const { addNotification } = useNotification();
    
    // Wizard State
    const [step, setStep] = useState(0);
    const [viewState, setViewState] = useState<'form' | 'analyzing'>('form');

    // Ad Data State
    const [title, setTitle] = useState('');
    const [categoryPath, setCategoryPath] = useState<string[]>([]);
    const [condition, setCondition] = useState<AdCondition>('used');
    const [price, setPrice] = useState('');
    const [marketAnalysis, setMarketAnalysis] = useState<{ low: number, high: number } | null>(null);
    const [listingType, setListingType] = useState<ListingType>('buy-now');
    const [auctionType, setAuctionType] = useState<AuctionType>('english');
    const [duration, setDuration] = useState('24');
    const [description, setDescription] = useState('');
    const [media, setMedia] = useState<Media[]>([]);
    
    // UI & Loading State
    const [loading, setLoading] = useState(false);
    const [moderating, setModerating] = useState(false);
    const [refineLoading, setRefineLoading] = useState<string | null>(null);
    const [fieldLoading, setFieldLoading] = useState<'title' | 'category' | 'description' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    
    // Guest-to-user flow state
    const adDataRef = useRef<any>(null);
    const authPendingRef = useRef(false);
    
    useEffect(() => {
        // This effect handles the automatic submission after a guest signs up.
        if (authPendingRef.current && identity?.type === 'FULL_USER' && adDataRef.current) {
            authPendingRef.current = false;
            _submitAd(adDataRef.current);
            adDataRef.current = null;
        }
    }, [identity]);


    const handleNext = () => setStep(prev => Math.min(prev + 1, STEPS.length - 1));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 0));

    const handleInitialMediaUpload = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        
        const file = files[0];
        setError(null);

        // Immediately create a media object and add to state
        const mediaObject: Media = {
            type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'pdf',
            url: URL.createObjectURL(file),
            thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined, // Placeholder, video thumbs are harder
            fileName: file.name,
            file: file,
        };
        setMedia([mediaObject]);

        if (mediaObject.type === 'image') {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = (reader.result as string).split(',')[1];
                setViewState('analyzing');
                try {
                    const aiResult = await api.generateAdFromImage(base64Image);
                    setTitle(aiResult.title);
                    setDescription(aiResult.description);
                    setPrice(aiResult.suggestedPrice.toString());
                    setCategoryPath(aiResult.categoryPath);
                    setCondition(aiResult.condition);
                } catch (err) {
                    const msg = err instanceof Error ? err.message : 'AI analysis failed.';
                    setError(msg);
                    addNotification(msg, 'error');
                } finally {
                    setViewState('form');
                    handleNext();
                }
            };
            reader.readAsDataURL(file);
        } else {
            // For video/pdf, just move to the next step without AI analysis
            handleNext();
        }
    };
    
    const handleAdditionalFileUploads = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files);
        
        const newMediaObjects: Media[] = newFiles.map(file => {
            const type: MediaType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'pdf';
            const url = URL.createObjectURL(file);
            return {
                type,
                url,
                thumbnailUrl: type === 'image' ? url : undefined, // Again, placeholder for non-image thumbnails
                fileName: file.name,
                file,
            };
        });
        setMedia(prev => [...prev, ...newMediaObjects]);
    }

    const handleAddYoutubeLink = () => {
        const url = prompt("Paste the YouTube video URL:");
        if (url) {
            const videoId = getYouTubeVideoId(url);
            if (videoId) {
                const newMedia: Media = {
                    type: 'youtube',
                    url: `https://www.youtube.com/embed/${videoId}`,
                    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                };
                setMedia(prev => [...prev, newMedia]);
            } else {
                addNotification("Invalid YouTube URL provided.", 'error');
            }
        }
    };

    const removeMedia = (index: number) => {
        setMedia(prev => prev.filter((_, i) => i !== index));
    }
    
    useEffect(() => {
        if(step === 2 && title) { // Pricing step
            const fetchAnalysis = async () => {
                const analysis = await api.getMarketPriceAnalysis(title);
                setMarketAnalysis(analysis);
            }
            fetchAnalysis();
        }
    }, [step, title]);
    
    const handleRefineDescription = async (instruction: 'shorten' | 'bullet_points' | 'seo') => {
        setRefineLoading(instruction);
        try {
            const refinedText = await api.refineText(description, instruction);
            setDescription(refinedText);
        } catch(e) {
            addNotification('Failed to refine text.', 'error');
        } finally {
            setRefineLoading(null);
        }
    };

    const handleRegenerate = async (field: 'title' | 'category' | 'description') => {
        const firstImage = media.find(m => m.type === 'image');
        if (!firstImage || !firstImage.file || fieldLoading) {
            addNotification("Please upload an image first to use AI regeneration.", 'info');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
             const base64Image = (reader.result as string).split(',')[1];
            setFieldLoading(field);
            try {
                const result = await api.regenerateFieldFromImage(base64Image, field);
                if (field === 'title') setTitle(result.value as string);
                else if (field === 'description') setDescription(result.value as string);
                else if (field === 'category') setCategoryPath(result.value as string[]);
            } catch (err) {
                addNotification(`Failed to regenerate ${field}.`, 'error');
            } finally {
                setFieldLoading(null);
            }
        }
        reader.readAsDataURL(firstImage.file);
    };

    const handleClearField = (field: 'title' | 'description' | 'category') => {
        if (field === 'title') setTitle('');
        if (field === 'description') setDescription('');
        if (field === 'category') setCategoryPath([]);
    };
    
    const _submitAd = async (data: any) => {
        setError(null);
        setModerating(true);
        try {
            const modResult = await api.moderateAdContent({ title: data.title, description: data.description });
            if (!modResult.isSafe) {
                setError(modResult.reason || 'Content violates guidelines.');
                addNotification(modResult.reason || 'Content violates guidelines.', 'error');
                setModerating(false); return;
            }
        } catch (err) { setError('Failed to moderate content.'); setModerating(false); return; }
        setModerating(false);

        setLoading(true);
        try {
            const newAd = await api.createAd(data);
            addNotification('Ad saved as a local draft!', 'success');
            await refreshMarketplaceData();
            setActiveView(VIEWS.PROMOTION_CENTER, { adId: newAd.id });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create ad.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        const adData = {
            title, description, price: parseFloat(price), media, listingType, condition, categoryPath,
            version: 1, boostScore: 0, location: 'Unknown Location',
        };

        if (!identity) {
            adDataRef.current = adData;
            authPendingRef.current = true;
            promptForIdentity();
            return;
        }

        if (!title || !price || media.length === 0 || !condition || categoryPath.length === 0) {
            setError('Please ensure all details are filled and at least one media item is added.');
            return;
        }
        
        await _submitAd(adData);
    };
    
    const StepContainer: React.FC<{
        title: string; 
        children: React.ReactNode;
        showNext?: boolean;
        showBack?: boolean;
        onNext?: () => void;
        onBack?: () => void;
        isNextDisabled?: boolean;
        showCancel?: boolean;
        onCancel?: () => void;
    }> = ({ 
        title, 
        children, 
        showNext = true, 
        showBack = true, 
        onNext = handleNext, 
        onBack = handleBack, 
        isNextDisabled = false,
        showCancel = false,
        onCancel = () => {}
    }) => (
        <div className="mt-6">
            <h3 className="text-xl font-bold text-text-primary mb-4">{title}</h3>
            <div className="space-y-6">{children}</div>
            <div className="flex items-center justify-between mt-8">
                {showBack && step > 0 ? (
                    <button onClick={onBack} className="px-4 py-2 text-sm font-semibold rounded-lg text-text-secondary hover:bg-secondary">Back</button>
                ) : showCancel ? (
                    <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold rounded-lg text-text-secondary hover:bg-secondary border border-border-color">Cancel</button>
                ) : <div />}
                {showNext && <button onClick={onNext} disabled={isNextDisabled} className="px-6 py-2 text-sm font-semibold rounded-lg bg-accent text-white hover:bg-accent-hover disabled:opacity-50">Next</button>}
            </div>
        </div>
    );
    
    const renderContent = () => {
      if (viewState === 'analyzing') return <AIAnalysisProgress />;

      switch (step) {
        case 0: return <StepContainer 
                title="Start with a Photo, Video, or PDF" 
                showBack={false} 
                showNext={false}
                showCancel={true}
                onCancel={() => setActiveView(VIEWS.MARKETPLACE)}
            >
                <label htmlFor="file-upload" className="relative cursor-pointer bg-secondary rounded-lg border-2 border-dashed border-border-color flex flex-col items-center justify-center h-64 p-6 hover:border-accent transition-colors">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span className="mt-2 block text-lg font-semibold text-text-primary">Upload your item's media</span>
                    <span className="mt-1 block text-sm text-text-secondary">If you upload a photo, our AI will generate the details for you.</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => handleInitialMediaUpload(e.target.files)} accept="image/*,video/*,application/pdf" />
                </label>
                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
            </StepContainer>;
        case 1: return <StepContainer title="Confirm the details" isNextDisabled={!title || categoryPath.length === 0}>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-text-secondary">Title</label>
                  <div className="relative mt-1">
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="block w-full bg-secondary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm pr-20" />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
                        {fieldLoading === 'title' ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent" /> : <>
                            <button type="button" onClick={() => handleRegenerate('title')} className="p-1 text-text-secondary hover:text-accent rounded-full hover:bg-border-color" title="Regenerate with AI"><RefreshIcon className="h-4 w-4" /></button>
                            <button type="button" onClick={() => handleClearField('title')} className="p-1 text-text-secondary hover:text-red-500 rounded-full hover:bg-border-color" title="Clear title"><XMarkIcon className="h-4 w-4" /></button>
                        </>}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary">AI Suggested Category</label>
                  <div className="relative mt-1">
                    <button type="button" onClick={() => setIsCategoryModalOpen(true)} className="w-full text-left bg-secondary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm pr-20">
                        {categoryPath.length > 0 ? categoryPath.join(' > ') : <span className="text-text-secondary">Select a category...</span>}
                    </button>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
                       {fieldLoading === 'category' ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent" /> : <>
                            <button type="button" onClick={() => handleRegenerate('category')} className="p-1 text-text-secondary hover:text-accent rounded-full hover:bg-border-color" title="Suggest another category"><RefreshIcon className="h-4 w-4" /></button>
                            <button type="button" onClick={() => handleClearField('category')} className="p-1 text-text-secondary hover:text-red-500 rounded-full hover:bg-border-color" title="Clear category"><XMarkIcon className="h-4 w-4" /></button>
                       </>}
                    </div>
                  </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary">Condition</label>
                    <div className="flex space-x-2 mt-1">
                        {(['new', 'used', 'refurbished'] as AdCondition[]).map(c => 
                            <button key={c} type="button" onClick={() => setCondition(c)} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${condition === c ? 'bg-accent text-white' : 'bg-secondary hover:bg-border-color'}`}>{c.charAt(0).toUpperCase() + c.slice(1)}</button>
                        )}
                    </div>
                </div>
            </StepContainer>;
        case 2: return <StepContainer title="Set your price" isNextDisabled={!price}>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-text-secondary">Price</label>
                    <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1 block w-full bg-secondary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" placeholder="0.00" />
                    {marketAnalysis && <p className="text-xs text-text-secondary mt-2">Market Insight: Similar items are listed between ${marketAnalysis.low} and ${marketAnalysis.high}.</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary">Listing Type</label>
                    <div className="flex space-x-2 mt-1">
                        <button type="button" onClick={() => setListingType('buy-now')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${listingType === 'buy-now' ? 'bg-accent text-white' : 'bg-secondary hover:bg-border-color'}`}>Buy Now</button>
                        <button type="button" onClick={() => setListingType('auction')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${listingType === 'auction' ? 'bg-accent text-white' : 'bg-secondary hover:bg-border-color'}`}>Auction</button>
                    </div>
                </div>
                 {listingType === 'auction' && <div className="p-4 bg-primary rounded-lg border border-border-color space-y-4">
                    <h4 className="font-semibold text-text-primary">Auction Details</h4>
                    <select value={auctionType} onChange={e => setAuctionType(e.target.value as AuctionType)} className="w-full bg-secondary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-accent sm:text-sm">
                        <option value="english">English (Bids go up)</option>
                        <option value="dutch">Dutch (Price goes down)</option>
                        <option value="sealed">Sealed-Bid (Private)</option>
                    </select>
                </div>}
            </StepContainer>;
        case 3: return <StepContainer title="Describe your item" isNextDisabled={!description}>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Description</label>
                    <div className="relative mt-1"><textarea id="description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="block w-full bg-secondary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                        <div className="absolute top-2 right-2 flex items-center space-x-1">
                           {fieldLoading === 'description' ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent" /> : <>
                               <button type="button" onClick={() => handleRegenerate('description')} className="p-1 text-text-secondary bg-primary/50 backdrop-blur-sm rounded-full hover:text-accent hover:bg-border-color" title="Regenerate with AI"><RefreshIcon className="h-4 w-4" /></button>
                               <button type="button" onClick={() => handleClearField('description')} className="p-1 text-text-secondary bg-primary/50 backdrop-blur-sm rounded-full hover:text-red-500 hover:bg-border-color" title="Clear description"><XMarkIcon className="h-4 w-4" /></button>
                           </>}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs font-semibold text-text-secondary">Refine with AI:</span>
                        {[ {id: 'shorten', label: 'Shorten', icon: <ShortenIcon/>}, {id: 'bullet_points', label: 'Bullet Points', icon: <BulletPointsIcon/>}, {id: 'seo', label: 'Improve SEO', icon: <SeoIcon/>}, ].map(item => (
                            <button key={item.id} type="button" disabled={!!refineLoading} onClick={() => handleRefineDescription(item.id as any)} className="px-2 py-1 text-xs rounded-full bg-primary border border-border-color text-text-secondary hover:bg-border-color disabled:opacity-50 flex items-center">
                                {refineLoading === item.id ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-accent"/> : item.icon}
                                <span className="ml-1.5">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary">Media Manager</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                        {media.map((m, i) => <MediaPreview key={i} media={m} onRemove={() => removeMedia(i)} isFirst={i === 0} />)}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="more-files-upload" className="w-full flex-1 bg-secondary rounded-lg border-2 border-dashed border-border-color flex items-center justify-center cursor-pointer hover:border-accent">
                               <span className="text-2xl text-text-secondary">+</span>
                            </label>
                             <input id="more-files-upload" type="file" multiple className="sr-only" onChange={(e) => handleAdditionalFileUploads(e.target.files)} accept="image/*,video/*,application/pdf" />
                            <button type="button" onClick={handleAddYoutubeLink} className="w-full p-2 bg-secondary rounded-lg border-2 border-dashed border-border-color flex items-center justify-center cursor-pointer hover:border-accent">
                                <LinkIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </StepContainer>;
        case 4: return <StepContainer title="Review & Post" showNext={false} >
                <div className="p-3 bg-secondary rounded-lg border border-border-color space-y-3">
                    <img src={media[0]?.thumbnailUrl || media[0]?.url} alt="Ad preview" className="w-full h-40 object-cover rounded-md" />
                    <h4 className="font-bold text-xl text-text-primary">{title}</h4>
                    <p className="text-2xl font-bold text-accent">${parseFloat(price || '0').toFixed(2)}</p>
                    <div className="text-sm text-text-secondary"><p><strong>Category:</strong> {categoryPath.join(' > ')}</p><p><strong>Condition:</strong> {condition}</p></div>
                    <p className="text-sm text-text-secondary line-clamp-2">{description}</p>
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button onClick={handleSubmit} disabled={loading || moderating} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-accent hover:bg-accent-hover disabled:bg-gray-500">
                    {moderating ? 'Checking content...' : loading ? 'Posting...' : 'Post Ad'}
                </button>
            </StepContainer>;
        default: return null;
      }
    };

    return (
        <div className="py-4">
            <h2 className="text-2xl font-bold mb-1 text-text-primary">Create a New Listing</h2>
            <p className="text-sm text-text-secondary mb-4">Follow the steps to create your ad with AI assistance.</p>
            <Stepper currentStep={step} steps={STEPS} />
            {renderContent()}
            {isCategoryModalOpen && (
                <CategorySelectorModal 
                    onClose={() => setIsCategoryModalOpen(false)} 
                    onSelect={(path) => { setCategoryPath(path); setIsCategoryModalOpen(false); }}
                />
            )}
        </div>
    );
};

export default CreateAd;