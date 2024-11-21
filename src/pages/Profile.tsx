// src/pages/Profile.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null); // Store user profile
  const [posts, setPosts] = useState<any[]>([]); // Store user's posts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        window.location.href = '/'; // Redirect to login if no user
        return;
      }

      try {
        // Fetch user profile details (username)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single();

        if (userError) {
          throw userError;
        }

        setUserProfile(userData);

        // Fetch posts made by the user
        const { data: userPosts, error: postsError } = await supabase
          .from('posts')
          .select('id, content, created_at')
          .eq('user_id', user.id);

        if (postsError) {
          throw postsError;
        }

        setPosts(userPosts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      window.location.href = '/'; // Redirect to the homepage or login page after logout
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-semibold mb-4 text-center">Your Profile</h1>
      {userProfile ? (
        <div className="text-center mb-6">
          <img
            className="w-32 h-32 mx-auto rounded-full"
            src="https://www.kindpng.com/picc/m/171-1712282_profile-icon-png-profile-icon-vector-png-transparent.png"
            alt="Profile Icon"
          />
          <h2 className="mt-4 text-xl font-semibold">{userProfile.username}</h2>
        </div>
      ) : (
        <div>No profile found</div>
      )}

        {/* Logout Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none"
        >
          Logout
        </button>
      </div>
      
      <h2 className="mt-6 text-xl font-semibold">Your Posts</h2>
      {posts.length > 0 ? (
        <div className="mt-4">
          {posts.map((post) => (
            <div key={post.id} className="mb-4 p-4 border border-gray-300 rounded-lg shadow-sm">
              <p>{post.content}</p>
              <p className="text-sm text-gray-500 mt-2">Posted on: {new Date(post.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-4">No posts yet.</p>
      )}

      
    </div>
  );
};

export default Profile;


