import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const FeedPage: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [posts, setPosts] = useState<any[]>([]);
  const [usernames, setUsernames] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null); // Store logged-in username
  const navigate = useNavigate();

  // Fetch posts with mentions and username
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, content, image_url, username, mentions, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error.message);
      } else {
        setPosts(data || []);
      }
    };

    fetchPosts();
  }, []);

  // Fetch all usernames
  useEffect(() => {
    const fetchUsernames = async () => {
      const { data, error } = await supabase.from("users").select("username");

      if (error) {
        console.error("Error fetching usernames:", error.message);
      } else {
        setUsernames(data?.map((user) => user.username) || []);
      }
    };

    fetchUsernames();
  }, []);

  // Fetch current logged-in user's username
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        console.error("Error fetching logged-in user:", error?.message);
        return;
      }

      const { data: userData, error: userFetchError } = await supabase
        .from("users")
        .select("username")
        .eq("id", data.user.id)
        .single();

      if (userFetchError || !userData) {
        console.error("Error fetching current username:", userFetchError?.message);
        return;
      }

      setCurrentUser(userData.username);
    };

    fetchCurrentUser();
  }, []);

  const handleInputChange = (value: string) => {
    setContent(value);

    const mentionMatch = value.match(/@(\w*)$/);
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      const filteredUsernames = usernames.filter((username) =>
        username.toLowerCase().startsWith(query)
      );
      setSuggestions(filteredUsernames);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (username: string) => {
    const updatedContent = content.replace(/@\w*$/, `@${username} `);
    setContent(updatedContent);
    setShowSuggestions(false);
  };

  const handlePostSubmit = async () => {
    try {
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError || !data?.user) {
        console.error("Please log in first!");
        return;
      }

      const userId = data.user.id;

      const { data: userData, error: userFetchError } = await supabase
        .from("users")
        .select("username")
        .eq("id", userId)
        .single();

      if (userFetchError || !userData) {
        console.error("Error fetching username:", userFetchError?.message);
        return;
      }

      const username = userData.username;

      // Extract mentions from content
      const mentionRegex = /@(\w+)/g;
      const mentions = [...content.matchAll(mentionRegex)].map((match) => match[1]);

      const { error } = await supabase.from("posts").insert([
        {
          user_id: userId,
          username: username,
          content: content,
          image_url: imageUrl,
          mentions: mentions,
          created_at: new Date(),
        },
      ]);

      if (error) {
        console.error("Error inserting post:", error.message);
      } else {
        console.log("Post created successfully!");
        setContent("");
        setImageUrl("");

        const { data: newPosts } = await supabase
          .from("posts")
          .select("id, content, image_url, username, mentions, created_at")
          .order("created_at", { ascending: false });

        setPosts(newPosts || []);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during logout:", error.message);
        return;
      }
      console.log("Logout successful!");
      navigate("/auth");
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // Highlight mentions in post content
  const highlightMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g;

    return text.split(mentionRegex).map((part, index) => {
      // Check if this part is a valid mention
      if (index % 2 === 1 && usernames.includes(part)) {
        const isCurrentUser = part === currentUser;
        return (
          <span
            key={index}
            className={`font-bold ${
              isCurrentUser ? "text-red-500" : "text-blue-600"
            }`}
          >
            @{part}
          </span>
        );
      }

      // Otherwise, return the text as is
      return part;
    });
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Logout Button */}
      <div className="w-full flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Posting Section */}
      <div className="w-full bg-gray-100 p-4 rounded-lg mb-4 relative">
        <h2 className="text-xl font-semibold mb-2">Create a Post</h2>
        <textarea
          className="w-full p-2 border border-gray-300 rounded mb-2"
          placeholder="Write something..."
          value={content}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <button
          onClick={handlePostSubmit}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Post
        </button>

        {/* Username Suggestions */}
        {showSuggestions && (
          <div className="absolute bg-white border border-gray-300 rounded mt-2 w-full max-h-32 overflow-y-auto shadow-lg">
            {suggestions.map((username, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(username)}
              >
                @{username}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feed Section */}
      <div className="w-full h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg shadow-inner">
        <h2 className="text-2xl font-semibold mb-4">Feed</h2>
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts to show yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="border-b py-4 mb-4">
              <div className="flex items-center mb-2">
                <p className="font-semibold text-blue-600">{post.username}</p>
                <p className="text-sm text-gray-500 ml-2">
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
              <p className="text-gray-800 mb-2">
                {highlightMentions(post.content)}
              </p>
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="Post"
                  className="w-full h-auto rounded"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedPage;








