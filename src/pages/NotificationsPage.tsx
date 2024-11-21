import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { HiUserAdd, HiAtSymbol } from "react-icons/hi"; // Import appropriate icons
import { useNavigate } from "react-router-dom"; // Import useNavigate
import NavButtons from "../components/NavButtons"; // Import the reusable NavButtons component

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // To store the user's UUID
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch logged-in user's username and ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        console.error("Error fetching logged-in user:", error?.message);
        return;
      }

      const { data: userData, error: userFetchError } = await supabase
        .from("users")
        .select("id, username")
        .eq("id", data.user.id)
        .single();

      if (userFetchError || !userData) {
        console.error("Error fetching current username and ID:", userFetchError?.message);
        return;
      }

      setCurrentUser(userData.username);
      setCurrentUserId(userData.id); // Store the user's UUID
    };

    fetchCurrentUser();
  }, []);

  // Fetch notifications for the current user (mentions and follows)
  useEffect(() => {
    if (currentUser && currentUserId) {
      const fetchMentions = async () => {
        const { data, error } = await supabase
          .from("posts")
          .select("id, content, username, mentions, created_at")
          .contains("mentions", [currentUser]) // Fetch mentions
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching mentions:", error.message);
        }
        return data || []; // Always return an empty array if no data
      };

      const fetchFollows = async () => {
        const { data, error } = await supabase
          .from("followers")
          .select("id, follower_id, following_id, created_at")
          .eq("following_id", currentUserId) // Fetch follow notifications where the user is being followed
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching follows:", error.message);
        }

        // Map over the follow data and fetch the usernames
        const followNotifications = await Promise.all(
          data?.map(async (follow) => {
            const { data: followerData, error: userError } = await supabase
              .from("users")
              .select("username")
              .eq("id", follow.follower_id) // Fetch username using follower_id (UUID)
              .single();

            if (userError) {
              console.error("Error fetching username for follower:", userError.message);
            }

            return {
              type: "follow",
              sender_username: followerData?.username || "Unknown User", // Use the username of the follower
              created_at: follow.created_at,
            };
          }) || []
        );

        return followNotifications;
      };

      // Combine mentions and follows notifications
      const fetchNotifications = async () => {
        const mentions = await fetchMentions();
        const follows = await fetchFollows();

        // Combine both mentions and follows into a single notifications array
        const combinedNotifications = [
          ...mentions.map((mention) => ({
            type: "mention",
            sender_username: mention.username,
            content: mention.content,
            created_at: mention.created_at,
          })),
          ...follows.map((follow) => ({
            type: "follow",
            sender_username: follow.sender_username, // Use the username from the follows
            created_at: follow.created_at,
          })),
        ];

        setNotifications(combinedNotifications);
      };

      fetchNotifications();
    }
  }, [currentUser, currentUserId]);

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 items-center">
      <header className="w-full flex justify-center mb-4 items-center">
        <NavButtons /> {/* Use the reusable NavButtons component */}
      </header>
      <h2 className="text-2xl font-semibold mb-6 text-center">Notifications</h2>

      <div>
        {notifications.length === 0 ? (
          <p className="text-center text-gray-500">No notifications yet.</p>
        ) : (
          notifications.map((notification) => (
            <div key={notification.created_at} className="flex items-center justify-between border-b py-4">
              <div className="flex items-center">
                <div className="bg-blue-200 p-2 rounded-full">
                  {notification.type === "mention" ? (
                    <HiAtSymbol className="text-blue-600" size={20} />
                  ) : (
                    <HiUserAdd className="text-green-500" size={20} />
                  )}
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-800">
                    {notification.sender_username} {notification.type === "follow" ? "followed you" : "mentioned you"}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">{/* Optionally, add timestamp or icon logic */}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;




