import React, { useState, useEffect } from 'react';
import type { View, Theme } from '../../types';
import { VIEWS } from '../../constants/views';
import { useTheme } from '../../context/ThemeContext';
import * as api from '../../api';
import { useNotification } from '../../hooks/useNotification';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';

interface ThemeEditorProps {
    setActiveView: (view: View) => void;
}

const ThemeEditor: React.FC<ThemeEditorProps> = ({ setActiveView }) => {
    const { theme: initialTheme, setLiveTheme, loadTheme } = useTheme();
    const [theme, setTheme] = useState<Theme>(initialTheme);
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotification();

    useEffect(() => {
        // When a color is changed, update the live preview
        setLiveTheme(theme);
    }, [theme, setLiveTheme]);

    // Cleanup: Revert to the last published theme when leaving the editor
    useEffect(() => {
        return () => {
            loadTheme();
        };
    }, [loadTheme]);

    const handleColorChange = (key: keyof Theme, value: string) => {
        setTheme(prev => ({ ...prev, [key]: value }));
    };

    const handlePublish = async () => {
        setLoading(true);
        try {
            await api.publishTheme(theme);
            addNotification('Theme published successfully via P2P network!', 'success');
            setActiveView(VIEWS.ADMIN_DASHBOARD);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to publish theme.';
            addNotification(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const ColorInput: React.FC<{ colorKey: keyof Theme; label: string }> = ({ colorKey, label }) => (
        <div className="flex items-center justify-between">
            <label htmlFor={colorKey} className="text-sm font-medium text-text-secondary">{label}</label>
            <div className="flex items-center space-x-2">
                <span className="text-sm font-mono text-text-primary">{theme[colorKey]}</span>
                <input
                    id={colorKey}
                    type="color"
                    value={theme[colorKey]}
                    onChange={(e) => handleColorChange(colorKey, e.target.value)}
                    className="w-8 h-8 rounded-md border-none cursor-pointer bg-transparent"
                    style={{ backgroundColor: theme[colorKey] }}
                />
            </div>
        </div>
    );

    return (
        <div className="py-4">
            <div className="flex items-center mb-6">
                <button onClick={() => setActiveView(VIEWS.ADMIN_DASHBOARD)} className="p-2 rounded-full hover:bg-secondary">
                    <ChevronLeftIcon />
                </button>
                <h2 className="text-2xl font-bold text-text-primary ml-2">UI Theme Editor</h2>
            </div>

            <div className="space-y-6">
                <section className="bg-secondary rounded-lg border border-border-color p-4">
                    <h3 className="text-lg font-bold text-text-primary mb-4">Live Color Palette Editor</h3>
                    <div className="space-y-3">
                        <ColorInput colorKey="primary" label="Primary Background" />
                        <ColorInput colorKey="secondary" label="Secondary Background" />
                        <ColorInput colorKey="accent" label="Accent / Buttons" />
                        <ColorInput colorKey="accent-hover" label="Accent Hover" />
                        <ColorInput colorKey="text-primary" label="Primary Text" />
                        <ColorInput colorKey="text-secondary" label="Secondary Text" />
                        <ColorInput colorKey="border-color" label="Border Color" />
                    </div>
                </section>

                 <section className="bg-secondary rounded-lg border border-border-color p-4">
                    <h3 className="text-lg font-bold text-text-primary mb-2">Asset Management</h3>
                    <p className="text-xs text-text-secondary mb-4">Simulates updating image assets stored in the Admin's private cloud (Nextcloud/MinIO).</p>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Logo URL</label>
                            <input type="text" placeholder="https://.../logo.png" className="mt-1 block w-full bg-primary border border-border-color rounded-md py-1 px-2 text-text-primary text-sm" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-text-secondary">Default Background Image URL</label>
                            <input type="text" placeholder="https://.../background.webp" className="mt-1 block w-full bg-primary border border-border-color rounded-md py-1 px-2 text-text-primary text-sm" />
                        </div>
                    </div>
                </section>
                
                 <div className="p-3 bg-blue-900/50 rounded-lg text-center">
                    <p className="text-xs text-blue-200">
                        When published, this theme is digitally signed, encrypted, and broadcast via P2P to trusted nodes on the MAZDADY network. Clients download, verify the signature, and apply the theme without relying on any external CDN.
                    </p>
                </div>

                <button
                    onClick={handlePublish}
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-hover disabled:bg-gray-500"
                >
                    {loading ? 'Publishing via P2P...' : 'Publish Theme'}
                </button>
            </div>
        </div>
    );
};

export default ThemeEditor;