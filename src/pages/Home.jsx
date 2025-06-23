import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import appwriteService from "../appwrite/config";
import { Container, PostCard } from '../components';

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // loading state
  const searchTerm = useSelector((state) => state.search.term);

  useEffect(() => {
    setLoading(true);
    appwriteService.getPosts().then((posts) => {
      if (posts) {
        setPosts(posts.documents);
      }
      setLoading(false);
    });
  }, []);

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* 🔄 CSS Spinner */}
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
      </div>
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <div className=" flex w-full py-8 mt-4 items-center justify-center min-h-[75vh] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Container>
          <div className="flex flex-wrap ">
            <div className="p-2 w-full">
              <h1 className="text-3xl font-bold text-gray-400">
                {posts.length === 0
                  ? 'Login to read posts'
                  : 'No posts match your search'}
              </h1>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className='w-full py-8 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
      <Container>
        <div className='flex flex-wrap'>
          {filteredPosts.map((post) => (
            <div key={post.$id} className='p-2 w-1/4'>
              <PostCard {...post} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

export default Home;
