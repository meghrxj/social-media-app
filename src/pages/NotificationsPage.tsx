import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { HiUserAdd, HiAtSymbol } from "react-icons/hi"; 
import NavButtons from "../components/NavButtons"; 

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]); 
  const [currentUser, setCurrentUser] = useState<string | null>(null); 
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); 

  // fetch the logged-in user details (username and id)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        console.error("Couldn't get the logged-in user:", error?.message);
        return;
      }

      const { data: userData, error: userFetchError } = await supabase
        .from("users")
        .select("id, username")
        .eq("id", data.user.id)
        .single();

      if (userFetchError || !userData) {
        console.error("Couldn't fetch the user's username and ID:", userFetchError?.message);
        return;
      }

      setCurrentUser(userData.username); // set username for temporary use
      setCurrentUserId(userData.id); // uuid for the same
    };

    fetchCurrentUser();
  }, []);

  // fetching the notifications of the user from posts and followers table 
  useEffect(() => {
    if (currentUser && currentUserId) {
      // fetching the mention where the temporary user was mentioned from the posts table
      const fetchMentions = async () => {
        const { data, error } = await supabase
          .from("posts")
          .select("id, content, username, mentions, created_at")
          .contains("mentions", [currentUser]) 
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching mentions:", error.message);
        }
        return data || []; 
      };

      // fetching follows where the user was followed by someone from the followers table 
      const fetchFollows = async () => {
        const { data, error } = await supabase
          .from("followers")
          .select("id, follower_id, following_id, created_at")
          .eq("following_id", currentUserId) 
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching follows:", error.message);
        }

        // fetching the username from the id from the followers table
        const followNotifications = await Promise.all(
          data?.map(async (follow) => {
            const { data: followerData, error: userError } = await supabase
              .from("users")
              .select("username")
              .eq("id", follow.follower_id) // using followers id for getting the username
              .single();

            if (userError) {
              console.error("Error getting follower username:", userError.message);
            }

            return {
              type: "follow",
              sender_username: followerData?.username || "Unknown User", 
              created_at: follow.created_at,
            };
          }) || []
        );

        return followNotifications;
      };

      
      const fetchNotifications = async () => {
        const mentions = await fetchMentions();
        const follows = await fetchFollows();

        
        const Notifications = [
          ...mentions.map((mention) => ({
            type: "mention",
            sender_username: mention.username,
            content: mention.content,
            created_at: mention.created_at,
          })),
          ...follows.map((follow) => ({
            type: "follow",
            sender_username: follow.sender_username, 
            created_at: follow.created_at,
          })),
        ];

        setNotifications(Notifications); 
      };

      fetchNotifications();
    }
  }, [currentUser, currentUserId]);

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 items-center">
      <header className="w-full flex justify-center mb-4 items-center">
        <NavButtons /> 
      </header>
      <h2 className="text-2xl font-semibold mb-6 text-center">Notifications</h2>

      <div>
        {notifications.length === 0 ? (
          <p className="text-center text-gray-500">No notifications yet.</p>
        ) : (
          

          notifications.map((notification) => (
            <div key={notification.created_at} className="flex items-center justify-between border-b py-4">
              <div className="flex items-center">
                {/* icons for notification (mention or follower) */}
                <div className="bg-blue-200 p-2 rounded-full">
                  {notification.type === "mention" ? (
                    <HiAtSymbol className="text-blue-600" size={20} />
                  ) : (
                    <HiUserAdd className="text-green-500" size={20} />
                  )}
                </div>
              
                <div className="ml-4">
                  <p className="font-semibold text-gray-800">
                    {notification.sender_username}{" "}
                    {notification.type === "follow" ? "followed you" : "mentioned you"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;











