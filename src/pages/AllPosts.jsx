import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Container, PostCard } from '../components';
import appwriteService from "../appwrite/config";

function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);  // loading state
  const searchTerm = useSelector((state) => state.search.term);

  useEffect(() => {
    setLoading(true);
    appwriteService.getPosts([]).then((posts) => {
      if (posts) {
        setPosts(posts.documents);
      }
      setLoading(false); // stop loading
    });
  }, []);

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* 🌀 Cute Emoji Loader or Spinner */}
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>

      </div>
    );
  }

  return (
    <div className='w-full py-8 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
      <Container>
        <div className='flex flex-wrap'>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post.$id} className='p-2 w-1/4'>
                <PostCard {...post} />
              </div>
            ))
          ) : (
            <div className="text-2xl font-bold text-gray-400 w-full text-center">
              {posts.length === 0
                ? 'No posts available.'
                : 'No posts match your search.'}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

export default AllPosts;
