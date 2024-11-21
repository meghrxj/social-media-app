import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { FiMail, FiLock } from 'react-icons/fi'; // Icons for email and password
import { AiOutlineLoading3Quarters } from 'react-icons/ai'; // Loading spinner

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

        // Check if the user has set a username
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('username')
          .eq('email', email)
          .single();

        if (profileError) throw profileError;

        if (userProfile?.username) {
          window.location.href = '/home';
        } else {
          window.location.href = '/username';
        }
      } else {
        // Signing the user up
        const { data: signupData, error: signupError } = await supabase.auth.signUp({ email, password });
        if (signupError) throw signupError;

        window.location.href = '/username';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-50">
      {/* Logo */}
      <h1 className="text-4xl font-extrabold text-blue-600 mb-8">IGX</h1>

      {/* Card */}
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Welcome Back!' : 'Create an Account'}
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleAuth}
          disabled={loading}
          className={`w-full py-2 text-white font-semibold rounded-lg shadow-lg focus:outline-none ${
            loading
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 transition-colors'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <AiOutlineLoading3Quarters className="animate-spin" />
              Processing...
            </div>
          ) : (
            isLogin ? 'Login' : 'Sign Up'
          )}
        </button>

        {/* Toggle Login/Signup */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 font-semibold cursor-pointer hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
