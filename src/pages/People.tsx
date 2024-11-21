import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // Ensure you've set up Supabase client
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'; // Importing search icon from Heroicons
import NavButtons from "../components/NavButtons"; // Import the reusable NavButtons component

const People = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [userCounts, setUserCounts] = useState<{ [key: string]: { followersCount: number; followingCount: number } }>({});

  // Fetch the list of users based on the search term
  const fetchUsers = async () => {
    if (searchTerm.trim() === "") {
      setUsers([]);
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, username")
      .ilike("username", `%${searchTerm}%`);

    if (error) {
      console.error("Error fetching users", error);
      return;
    }

    setUsers(data || []);
    // Fetch counts for each user
    for (const user of data || []) {
      const counts = await fetchCounts(user.id);
      setUserCounts((prev) => ({
        ...prev,
        [user.id]: counts,
      }));
    }
  };

  // Fetch current user's ID
  const fetchUserId = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setUserId(data.user.id);
    }
  };

  // Fetch the list of users the current user follows
  const fetchFollowedUsers = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("followers")
      .select("following_id")
      .eq("follower_id", userId);

    if (error) {
      console.error("Error fetching followed users", error);
      return;
    }

    const followedSet = new Set(data?.map((row: any) => row.following_id));
    setFollowedUsers(followedSet);
  };

  // Fetch followers and following count for each user
  const fetchCounts = async (userId: string) => {
    const { data: followerData } = await supabase
      .from("followers")
      .select("id")
      .eq("following_id", userId);

    const { data: followingData } = await supabase
      .from("followers")
      .select("id")
      .eq("follower_id", userId);

    return {
      followersCount: followerData?.length || 0,
      followingCount: followingData?.length || 0,
    };
  };

  // Handle follow/unfollow action
  const handleFollow = async (targetUserId: string) => {
    if (!userId) return;

    // If the user is already following, unfollow
    if (followedUsers.has(targetUserId)) {
      const { error } = await supabase
        .from("followers")
        .delete()
        .match({ follower_id: userId, following_id: targetUserId });

      if (error) {
        console.error("Error unfollowing user", error);
        return;
      }

      setFollowedUsers((prev) => {
        const newFollowed = new Set(prev);
        newFollowed.delete(targetUserId);
        return newFollowed;
      });
    } else {
      // Otherwise, follow
      const { error } = await supabase
        .from("followers")
        .insert([{ follower_id: userId, following_id: targetUserId }]);

      if (error) {
        console.error("Error following user", error);
        return;
      }

      setFollowedUsers((prev) => {
        const newFollowed = new Set(prev);
        newFollowed.add(targetUserId);
        return newFollowed;
      });
    }

    // After follow/unfollow, re-fetch counts
    const counts = await fetchCounts(targetUserId);
    setUserCounts((prev) => ({
      ...prev,
      [targetUserId]: counts,
    }));
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFollowedUsers();
    }
  }, [userId]);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  return (
    <div className="flex justify-center items-topmin-h-screen">
      <div className="w-full max-w-xl p-4">
      <header className="w-full flex justify-between mb-4 items-center">
        <h1 className="text-2xl font-semibold">IGX</h1>
        <NavButtons /> {/* Use the reusable NavButtons component */}
      </header>
        {/* Search bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>

        {/* Users list */}
        <div className="space-y-4">
          {searchTerm.trim() === "" ? (
            <p className="text-center text-gray-500">Start typing to search for users...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500">No users found.</p>
          ) : (
            users.map((user) => {
              const counts = userCounts[user.id] || { followersCount: 0, followingCount: 0 };

              // Don't show follow/unfollow button for logged-in user
              if (user.id === userId) {
                return (
                  <div key={user.id} className="flex justify-between items-center p-4 border-b border-gray-200 bg-white rounded-lg shadow-md">
                    <div className="flex flex-col">
                      <span className="font-semibold text-lg">{user.username}</span>
                      <div className="text-sm text-gray-500">
                        <span className="mr-4">{`Followers: ${counts.followersCount}`}</span>
                        <span>{`Following: ${counts.followingCount}`}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={user.id} className="flex justify-between items-center p-4 border-b border-gray-200 bg-white rounded-lg shadow-md">
                  <div className="flex flex-col">
                    <span className="font-semibold text-lg">{user.username}</span>
                    <div className="text-sm text-gray-500">
                      <span className="mr-4">{`Followers: ${counts.followersCount}`}</span>
                      <span>{`Following: ${counts.followingCount}`}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFollow(user.id)}
                    className={`px-4 py-2 rounded-full ${
                      followedUsers.has(user.id) ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                    }`}
                  >
                    {followedUsers.has(user.id) ? "Unfollow" : "Follow"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default People;




















