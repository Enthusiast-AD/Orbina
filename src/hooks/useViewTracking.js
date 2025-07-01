import { useEffect, useRef } from 'react';
import viewsService from '../appwrite/views';

export const useViewTracking = (postId, userId = null, post = null) => {
  const viewTracked = useRef(false);

  useEffect(() => {
    const trackView = async () => {
      // Only track if we have a post and haven't tracked yet
      if (!post || !postId || viewTracked.current) return;
      
      try {
        // Add a small delay to avoid tracking views from bots/crawlers
        const timer = setTimeout(async () => {
          const newViewCount = await viewsService.trackView(postId, userId);
          if (newViewCount !== null) {
            console.log(`View tracked for post ${postId}. New count: ${newViewCount}`);
          }
          viewTracked.current = true;
        }, 1500); // 1.5 second delay

        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();
  }, [postId, userId, post]);

  return { viewTracked: viewTracked.current };
};