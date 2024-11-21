import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const MentionsPage: React.FC = () => {
  const [mentions, setMentions] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Fetch logged-in user's username
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

  // Fetch mentions for the current user
  useEffect(() => {
    if (currentUser) {
      const fetchMentions = async () => {
        const { data, error } = await supabase
          .from("posts")
          .select("id, content, username, mentions, created_at")
          .contains("mentions", [currentUser])  // This checks if the mentions array contains the current user's username
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching mentions:", error.message);
        } else {
          setMentions(data || []);
        }
      };

      fetchMentions();
    }
  }, [currentUser]);

  return (
    <div className="w-full bg-gray-50 p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Mentions</h2>
      <div>
        {mentions.length === 0 ? (
          <p className="text-center text-gray-500">No mentions yet.</p>
        ) : (
          mentions.map((mention) => (
            <div key={mention.id} className="border-b py-4">
              <div className="flex items-center mb-2">
                <p className="font-semibold text-blue-600">{mention.username}</p>
                <p className="text-sm text-gray-500 ml-2">
                  {new Date(mention.created_at).toLocaleString()}
                </p>
              </div>
              <p className="text-gray-800">
                {mention.username} mentioned you in a post
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MentionsPage;
