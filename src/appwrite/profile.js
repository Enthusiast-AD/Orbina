import conf from '../conf/conf.js';
import { Client, ID, Databases, Storage, Query } from "appwrite";

export class ProfileService {
    client = new Client();
    databases;
    bucket;
    
    constructor(){
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);
    }

    async createProfile({userName, bio = "", location = "", website = "", profileImage = null, userId, twitter = "", github = "", linkedIn = ""}) {
        try {
            // console.log("Creating profile for user:", userId);
            
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteProfileCollectionId,
                ID.unique(), 
                {
                    userName,
                    bio,
                    location,
                    website,
                    profileImage,
                    userId, 
                    twitter,
                    github,
                    linkedIn,
                }
            );
        } catch (error) {
            console.log("Appwrite service :: createProfile :: error", error);
            throw error;
        }
    }

    
    async updateProfile({userName, bio = "", location = "", website = "", profileImage = null, userId, twitter = "", github = "", linkedIn = ""}) {
        try {
            // console.log("Updating profile for user:", userId);
            
            const existingProfile = await this.getProfile(userId);
            
            if (!existingProfile) {
                console.log("Profile not found, creating new one");
                return await this.createProfile({userName, bio, location, website, profileImage, userId, twitter, github, linkedIn});
            }

            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteProfileCollectionId,
                existingProfile.$id,
                {
                    userName,
                    bio,
                    location,
                    website,
                    profileImage,
                    userId,
                    twitter,
                    github,
                    linkedIn,
                }
            );
        } catch (error) {
            console.log("Appwrite service :: updateProfile :: error", error);
            throw error;
        }
    }

    
    async getProfile(userId) {
        try {
            // console.log("Fetching profile for user:", userId);
            
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteProfileCollectionId,
                [Query.equal("userId", userId)]
            );

            if (result.documents && result.documents.length > 0) {
                return result.documents[0]; 
            }
            
            return null;
        } catch (error) {
            console.log("❌ Appwrite service :: getProfile :: error", error);
            return null;
        }
    }

    
    async uploadProfileImage(file) {
        try {
            return await this.bucket.createFile(
                conf.appwriteBucketId ,
                ID.unique(),
                file
            );
        } catch (error) {
            console.log("Appwrite service :: uploadProfileImage :: error", error);
            throw error;
        }
    }

    async deleteProfileImage(fileId) {
        try {
            await this.bucket.deleteFile(
                conf.appwriteBucketId,
                fileId
            );
            return true;
        } catch (error) {
            console.log("Appwrite service :: deleteProfileImage :: error", error);
            return false;
        }
    }

getProfileImageView(fileId) {
    try {
        const bucketId = conf.appwriteBucketId ;
        
        if (!bucketId) {
            console.log("No bucket ID configured");
            return null;
        }

        if (!fileId) {
            console.log("No fileId provided for profile image");
            return null;
        }

        return this.bucket.getFileView(bucketId, fileId);
    } catch (error) {
        console.log("Appwrite service :: getProfileImageView :: error", error);
        return null;
    }
}

    
    removeFromFailedAttempts(userId) {
        try {
            if (typeof window !== 'undefined') {
                const failed = JSON.parse(localStorage.getItem('profileFailedAttempts') || '[]');
                const filtered = failed.filter(id => id !== userId);
                localStorage.setItem('profileFailedAttempts', JSON.stringify(filtered));
            }
        } catch (error) {
            console.log("Error cleaning failed attempts:", error);
        }
    }


    async profileExists(userId) {
        try {
            const profile = await this.getProfile(userId);
            return profile !== null;
        } catch (error) {
            return false;
        }
    }
}

const profileService = new ProfileService();
export default profileService;