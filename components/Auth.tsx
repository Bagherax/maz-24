import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MazdadyLogo from './ui/MazdadyLogo';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      // The onAuthChange listener in AuthContext will handle the state update
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-secondary rounded-lg shadow-lg">
        <div className="flex justify-center">
            <MazdadyLogo className="h-12 w-12" />
        </div>
        <div>
          <h2 className="text-center text-3xl font-extrabold text-text-primary">
            {isLogin ? 'Sign in to your account' : 'Create an account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
        <div className="text-sm text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-accent hover:text-accent-hover">
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
         <div className="text-center">
            <p className="text-xs text-text-secondary">Secured by MAZ Auth Service (Keycloak/OAuth 2.0)</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
