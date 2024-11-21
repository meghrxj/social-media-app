// src/pages/Username.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Username: React.FC = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null); // Track the user object

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        window.location.href = '/'; // Redirect to login if no user
      } else {
        setUser(user); // Set the user object to state
      }
    };
    fetchUser();
  }, []);

  const handleSaveUsername = async () => {
    if (!user) {
      console.log('No user is logged in!');
      return;
    }

    setLoading(true);
    try {
      // Fetch the user's email from auth.users table
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw new Error('Failed to get user data');
      }

      // Insert username into public.users table with email
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: authUser?.user?.email, // Add email to the upsert data
          username
        })
        .single();

      if (error) {
        throw error;
      }

      console.log('Username saved successfully!');
      window.location.href = '/profile'; // Redirect to profile page after saving username
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Set Your Username</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      <button
        onClick={handleSaveUsername}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? 'Saving...' : 'Save Username'}
      </button>
    </div>
  );
};

export default Username;









