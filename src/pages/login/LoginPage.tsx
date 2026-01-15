import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { signIn, loading, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setError(null);
      await signIn();
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    }
  };

  React.useEffect(() => {
    if (user) {
      navigate('/nextstep');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
        
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Only authorized users can access this application.
          Contact the administrator if you need access.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;