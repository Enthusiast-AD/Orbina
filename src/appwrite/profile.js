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

    // Auto-create profile during signup
    async createProfile({
        userId,
        userName,
        bio = "",
        location = "",
        website = "",
        twitter = "",
        github = "",
        linkedIn = "",
        profileImage = null
    }) {
        try {
            // Check if profile already exists
            const existingProfile = await this.getProfile(userId);
            if (existingProfile) {
                console.log('Profile already exists for user:', userId);
                return existingProfile;
            }

            const profile = await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteProfileCollectionId,
                ID.unique(),
                {
                    userId,
                    userName,
                    bio,
                    location,
                    website,
                    twitter,
                    github,
                    linkedIn,
                    profileImage
                }
            );
            
            console.log('Profile created successfully:', profile);
            return profile;
        } catch (error) {
            console.error("Error creating profile:", error);
            throw error;
        }
    }

    async updateProfile({
        userId,
        userName,
        bio,
        location,
        website,
        twitter,
        github,
        linkedIn,
        profileImage
    }) {
        try {
            // Get existing profile
            const existingProfile = await this.getProfile(userId);
            if (!existingProfile) {
                // If no profile exists, create one
                return await this.createProfile({
                    userId,
                    userName,
                    bio,
                    location,
                    website,
                    twitter,
                    github,
                    linkedIn,
                    profileImage
                });
            }

            // Update existing profile
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteProfileCollectionId,
                existingProfile.$id,
                {
                    userName,
                    bio,
                    location,
                    website,
                    twitter,
                    github,
                    linkedIn,
                    profileImage
                }
            );
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    }

    async getProfile(userId) {
        try {
            const profiles = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteProfileCollectionId,
                [Query.equal("userId", userId)]
            );
            
            return profiles.documents.length > 0 ? profiles.documents[0] : null;
        } catch (error) {
            console.error("Error fetching profile:", error);
            return null;
        }
    }

    async uploadProfileImage(file) {
        try {
            return await this.bucket.createFile(
                conf.appwriteBucketId,
                ID.unique(),
                file
            );
        } catch (error) {
            console.error("Error uploading profile image:", error);
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
            console.error("Error deleting profile image:", error);
            return false;
        }
    }

    getProfileImageView(fileId) {
        try {
            return this.bucket.getFileView(
                conf.appwriteBucketId,
                fileId
            );
        } catch (error) {
            console.error("Error getting profile image view:", error);
            return null;
        }
    }

    // Helper method to remove failed attempts from cache
    removeFromFailedAttempts(userId) {
        try {
            if (typeof window !== 'undefined') {
                const failed = JSON.parse(localStorage.getItem('profileFailedAttempts') || '[]');
                const filtered = failed.filter(id => id !== userId);
                localStorage.setItem('profileFailedAttempts', JSON.stringify(filtered));
            }
        } catch (error) {
            console.error("Error removing from failed attempts:", error);
        }
    }
}

const profileService = new ProfileService();
export default profileService;