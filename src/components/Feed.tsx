import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { HiOutlineUser, HiOutlineCalendar } from "react-icons/hi";
import { MdImage } from "react-icons/md";

const Feed: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [posts, setPosts] = useState<any[]>([]);
  const [usernames, setUsernames] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // fetching posts details from the posts table
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, content, image_url, username, mentions, created_at")
        .order("created_at", { ascending: false });

      if (!error) setPosts(data || []);
    };

    fetchPosts();
  }, []);

  // fetching username from the users table
  useEffect(() => {
    const fetchUsernames = async () => {
      const { data, error } = await supabase.from("users").select("username");
      if (!error) setUsernames(data?.map((user) => user.username) || []);
    };

    fetchUsernames();
  }, []);

  // fetching username of the current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("username")
          .eq("id", data.user.id)
          .single();

        setCurrentUser(userData?.username || null);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleInputChange = (value: string) => {
    setContent(value);
  //MENTION FEATURE (Using @ to mention a user)
    const mentionMatch = value.match(/@(\w*)$/);
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      const filteredUsernames = usernames.filter((username) =>
        username.toLowerCase().startsWith(query)
      );
      setSuggestions(filteredUsernames); //showing suggestions based on the username for mentioning a user
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (username: string) => {
    setContent(content.replace(/@\w*$/, `@${username} `));
    setShowSuggestions(false);
  };

  //post function to create new post and also updating the posts table on supabase
  const handlePostSubmit = async () => {
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data?.user) return;

    const { data: userData } = await supabase
      .from("users")
      .select("username")
      .eq("id", data.user.id)
      .single();

    if (userData) {
      const mentions = [...content.matchAll(/@(\w+)/g)].map((match) => match[1]);
      const { error } = await supabase.from("posts").insert([
        {
          user_id: data.user.id,
          username: userData.username,
          content,
          image_url: imageUrl,
          mentions,
          created_at: new Date(),
        },
      ]);

      if (!error) {
        setContent("");
        setImageUrl("");
        const { data: newPosts } = await supabase
          .from("posts")
          .select("id, content, image_url, username, mentions, created_at")
          .order("created_at", { ascending: false });

        setPosts(newPosts || []);
      }
    }
  };

    //highlighting the mentions if user is being mentioned the i used red and if user has mentioned someone i used blue 
  const highlightMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g;
    return text.split(mentionRegex).map((part, index) =>
      index % 2 === 1 && usernames.includes(part) ? (
        <span key={index} className={`font-bold ${part === currentUser ? "text-red-500" : "text-blue-600"}`}>
          @{part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto bg-gray-100 rounded-lg shadow-lg space-y-6">
      {/* create post */}
      <div className="w-full bg-white p-4 rounded-lg shadow-md relative">
        <h2 className="text-xl font-semibold mb-4">Create a Post</h2>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 mb-3"
          placeholder="Write something..."
          value={content}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        <div className="flex items-center space-x-3">
          <MdImage size={24} className="text-gray-600" />
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
        <button
          onClick={handlePostSubmit}
          className="w-full mt-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Post
        </button>

        {/* mention suggestions */}
        {showSuggestions && (
          <div className="absolute bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg w-full">
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

      {/* feed section */}
      <div className="w-full">
        <h2 className="text-2xl font-semibold mb-4">Your Feed</h2>
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts to show yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <HiOutlineUser size={24} className="text-gray-600" />
                <p className="font-bold text-blue-600">{post.username}</p>
                <HiOutlineCalendar size={18} className="text-gray-500 ml-auto" />
                <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
              </div>
              <p className="text-gray-800 mb-3">{highlightMentions(post.content)}</p>
              {post.image_url && (
                <img src={post.image_url} alt="Post" className="w-full rounded-md shadow-sm" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;






