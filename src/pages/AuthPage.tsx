import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        // Logging the user in
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        console.log('Login successful!');
        window.location.href = "/feed"; // Redirecting to the feed page directly after login
      } else {
        // Signing the user up
        const { data: signupData, error: signupError } = await supabase.auth.signUp({ email, password });
        if (signupError) throw signupError;

        console.log('Signup successful! Check your email for verification.');
        window.location.href = "/profile"; // Redirecting to the profile page to set the username
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">{isLogin ? 'Login' : 'Signup'}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2 p-2 border border-gray-300 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      <button
        onClick={handleAuth}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? 'Processing...' : isLogin ? 'Login' : 'Signup'}
      </button>
      <p className="mt-4">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <span
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-500 cursor-pointer"
        >
          {isLogin ? 'Signup' : 'Login'}
        </span>
      </p>
    </div>
  );
};

export default AuthPage;






