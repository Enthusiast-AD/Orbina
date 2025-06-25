const conf = {
    appwriteUrl: String(import.meta.env.VITE_APPWRITE_URL),
    appwriteProjectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
    appwriteDatabaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
    appwriteCollectionId: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID),
    appwriteProfileCollectionId: String(import.meta.env.VITE_APPWRITE_PROFILE_COLLECTION_ID),
    appwriteLikesCollectionId: String(import.meta.env.VITE_APPWRITE_LIKES_COLLECTION_ID),
    appwriteBookmarksCollectionId: String(import.meta.env.VITE_APPWRITE_BOOKMARKS_COLLECTION_ID),
    appwriteMessagesCollectionId: String(import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID),
    appwriteBucketId: String(import.meta.env.VITE_APPWRITE_BUCKET_ID),
}


export default conf