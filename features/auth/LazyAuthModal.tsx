import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/ui/Modal';
import MazdadyLogo from '../../components/ui/MazdadyLogo';

const LazyAuthModal: React.FC = () => {
  const { 
    authModalState, 
    closeAuthModal, 
    setAuthModalState,
    createTempIdentity,
    login,
    register 
  } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isOpen = authModalState !== 'closed';

  const handleClose = () => {
    setError(null);
    setLoading(false);
    closeAuthModal();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (authModalState === 'login') {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      // On success, the AuthContext listener will close the modal.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderTempPrompt = () => (
    <div className="text-center">
      <h3 className="text-lg font-bold text-text-primary">Create an Identity</h3>
      <p className="text-sm text-text-secondary mt-2">
        To interact, you need an identity. Continue as a temporary guest (your data will be deleted on exit) or sign up to save your data permanently.
      </p>
      <div className="mt-6 space-y-3">
        <button
          onClick={createTempIdentity}
          className="w-full p-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
        >
          Continue as Temporary Guest
        </button>
        <button
          onClick={() => setAuthModalState('login')}
          className="w-full p-3 bg-secondary text-text-primary font-semibold rounded-lg hover:bg-border-color transition-colors"
        >
          Sign In or Register
        </button>
      </div>
    </div>
  );
  
  const renderAuthForm = () => {
      const isLogin = authModalState === 'login';
      return (
        <div>
            <div className="flex justify-center mb-4">
              <MazdadyLogo className="text-5xl" />
            </div>
            <h2 className="text-center text-xl font-bold text-text-primary mb-4">
                {isLogin ? 'Sign In' : 'Create a Permanent Account'}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-border-color bg-primary placeholder-text-secondary text-text-primary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-border-color bg-primary placeholder-text-secondary text-text-primary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-border-color bg-primary placeholder-text-secondary text-text-primary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-hover disabled:bg-gray-500"
                >
                  {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Register')}
                </button>
              </div>
            </form>
             <div className="text-sm text-center mt-4">
              <button onClick={() => setAuthModalState(isLogin ? 'register' : 'login')} className="font-medium text-accent hover:text-accent-hover">
                {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign in'}
              </button>
            </div>
        </div>
      )
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={handleClose} title="Identity Required">
      {authModalState === 'temp_prompt' && renderTempPrompt()}
      {(authModalState === 'login' || authModalState === 'register') && renderAuthForm()}
    </Modal>
  );
};

export default LazyAuthModal;
