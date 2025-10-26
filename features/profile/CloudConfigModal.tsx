import React, { useState } from 'react';
import type { CloudConfig } from '../../types';
import Modal from '../../components/ui/Modal';
import { useNotification } from '../../hooks/useNotification';
import * as api from '../../api';
import { NextcloudIcon } from '../../components/icons/NextcloudIcon';
import { MinioIcon } from '../../components/icons/MinioIcon';

interface CloudConfigModalProps {
  onClose: () => void;
  onSave: () => void;
  currentConfig: CloudConfig | null;
}

const CloudConfigModal: React.FC<CloudConfigModalProps> = ({ onClose, onSave, currentConfig }) => {
  const [provider, setProvider] = useState<'nextcloud' | 'minio'>(currentConfig?.provider || 'nextcloud');
  const [serverUrl, setServerUrl] = useState(currentConfig?.serverUrl || '');
  const [username, setUsername] = useState(currentConfig?.username || '');
  const [password, setPassword] = useState(currentConfig?.password || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification();

  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);
    await new Promise(res => setTimeout(res, 800)); // Simulate network request
    if (serverUrl && username && password) {
        addNotification('Connection successful!', 'success');
    } else {
        setError('Please fill all fields to test the connection.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
        await api.saveCloudConfig({ provider, serverUrl, username, password });
        addNotification('Cloud configuration saved!', 'success');
        onSave();
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save configuration.';
        setError(message);
        addNotification(message, 'error');
    } finally {
        setLoading(false);
    }
  };
  
  const ProviderButton: React.FC<{type: 'nextcloud' | 'minio', label: string, icon: React.ReactElement}> = ({type, label, icon}) => (
    <button
        type="button"
        onClick={() => setProvider(type)}
        className={`w-full flex items-center justify-center p-3 text-sm font-semibold rounded-md transition-all border-2 ${provider === type ? 'bg-accent/10 border-accent text-accent' : 'bg-secondary border-border-color hover:border-white/20'}`}
      >
        {icon}
        <span className="ml-2">{label}</span>
      </button>
  );

  return (
    <Modal onClose={onClose} title="Configure Personal Cloud">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Provider</label>
            <div className="flex space-x-2">
                <ProviderButton type="nextcloud" label="Nextcloud (WebDAV)" icon={<NextcloudIcon />} />
                <ProviderButton type="minio" label="MinIO (S3)" icon={<MinioIcon />} />
            </div>
        </div>
        <div>
          <label htmlFor="serverUrl" className="block text-sm font-medium text-text-secondary">Server URL</label>
          <input type="text" id="serverUrl" value={serverUrl} onChange={e => setServerUrl(e.target.value)} required className="mt-1 block w-full bg-primary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent" />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-text-secondary">{provider === 'minio' ? 'Access Key ID' : 'Username'}</label>
          <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 block w-full bg-primary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-secondary">{provider === 'minio' ? 'Secret Access Key' : 'App Password'}</label>
          <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full bg-primary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent" />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex items-center space-x-2 pt-2">
          <button type="button" onClick={handleTestConnection} disabled={loading} className="w-full flex justify-center py-2 px-4 border border-border-color rounded-md text-sm font-medium text-text-primary bg-secondary hover:bg-border-color disabled:opacity-50">
            {loading ? 'Testing...' : 'Test Connection'}
          </button>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-accent hover:bg-accent-hover disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CloudConfigModal;
