import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 
import { GraphQLClient } from 'graphql-request';

// GRAPHQL Endpoints (will hide the creds later on in the .env)
const SUPABASE_GRAPHQL_URL = 'https://gltjnfbbnsgthusrtrvu.supabase.co/graphql/v1'; 
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdGpuZmJibnNndGh1c3J0cnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxMjA2OTAsImV4cCI6MjA0NzY5NjY5MH0.6LXpI47tJ9uxXpUiX6JI_elFWISM1Jp23hmYm-0x0-o'; // API Key

const Username = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Fetch the session details and check if the user is logged in
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          throw new Error('No session available');
        }
        const session = data.session;
        setUser(session.user); // saving the user to a session state 
      } catch (err: any) {
        console.error(err);
        navigate('/'); // navigating back incase of no session or unathorized access
      }
    };

    fetchUser();
  }, [navigate]);

  // saving the username function
  const handleSaveUsername = async () => {
    if (!user) {
      console.error('No user is logged in!');
      return;
    }

    setLoading(true);

    try {
      // checking token accesss
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('No access token available');
      }

      // checking if the user id matches with the session user id for authorization 
      if (user.id !== session.data.session.user.id) {
        throw new Error('User ID mismatch!');
      }

      // using session access token for graphql 
      const client = new GraphQLClient(SUPABASE_GRAPHQL_URL, {
        headers: {
          apiKey: SUPABASE_API_KEY, 
          Authorization: `Bearer ${session.data.session.access_token}`, // token authorization using JWT
        },
      });

      // Graphql Mutation for updating the username 
      const mutation = `
        mutation UpdateUsername($set: usersUpdateInput!, $filter: usersFilter!) {
          updateusersCollection(set: $set, filter: $filter) {
            affectedCount
          }
        }
      `;

      //variables for the mutation set( for passing the username ) and fileter(for checking if the id matches the users id)
      const variables = {
        set: {
          username, 
        },
        filter: {
          id: { eq: user.id }, 
        },
      };

      // finally executing the graphql mutation 
      const response = await client.request(mutation, variables);
      navigate('/profile'); 

    } catch (err: any) {
      console.error('Failed to save username:', err);
      setError(err.message || 'An error occurred while saving your username.');
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
































