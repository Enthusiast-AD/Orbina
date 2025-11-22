const conf = {
    appwriteUrl: import.meta.env.VITE_APPWRITE_URL,
    appwriteProjectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    appwriteDatabaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    appwriteCollectionId: import.meta.env.VITE_APPWRITE_COLLECTION_ID,
    appwriteProfileCollectionId: import.meta.env.VITE_APPWRITE_PROFILE_COLLECTION_ID,
    appwriteLikesCollectionId: import.meta.env.VITE_APPWRITE_LIKES_COLLECTION_ID,
    appwriteBookmarksCollectionId: import.meta.env.VITE_APPWRITE_BOOKMARKS_COLLECTION_ID,
    appwriteMessagesCollectionId: import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID,
    appwriteBucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID,
}

export default conf