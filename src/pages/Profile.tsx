import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FiLogOut } from 'react-icons/fi'; 
import { FaRegCalendarAlt } from 'react-icons/fa'; 
import { HiOutlineUserCircle } from 'react-icons/hi'; 
import NavButtons from "../components/NavButtons"; 
import { useNavigate } from 'react-router-dom'; 

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        navigate('/'); // Redirect incase of unauthorized access
        return;
      }
        //fetching user details to show on profile
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single();

        if (userError) {
          throw userError;
        }
        
        //after fetching using the data to show details of users like username, post fetched from userid from above func
        setUserProfile(userData);

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
  }, [navigate]); 

    //LOGOUT FUNCTION (using supabase for signout)
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      navigate('/');
    }
  };

  if (loading) return <div className="text-center text-gray-600">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <header className="w-full flex justify-between mb-4 items-center">
        <h1 className="text-2xl font-semibold">IGX</h1>
        <NavButtons /> 
      </header>

      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <HiOutlineUserCircle className="w-32 h-32 text-gray-400" />
        </div>
        {userProfile && (
          <h2 className="mt-4 text-2xl font-bold text-gray-800">{userProfile.username}</h2>
        )}
      </div>

      {/* Logout button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors"
        >
          <FiLogOut className="text-lg" />
          Logout
        </button>
      </div>

      {/* Posts made by the user*/}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Your Posts</h2>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-gray-700">{post.content}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <FaRegCalendarAlt />
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No posts yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;




