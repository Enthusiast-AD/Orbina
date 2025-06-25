# Todo

- profile veiwing from home 
- like counts and like save in database 
- author profile remove the 
- profle update the article published and bookmarks 

4. Performance Issues
No pagination or lazy loading for posts:
All posts are loaded in one go; this will get slow as database grows.
No memoization or caching for posts or profile fetches.
No error boundaries or loading fallback for all components.

2. Post Filtering & Search
Search only filters posts already fetched & stored in state.
If there are many posts, this can be slow.
No server-side filtering or pagination.
In AllPosts and Home, all posts are fetched at once (could be slow with large data).