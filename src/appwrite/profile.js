import conf from '../conf/conf.js';
import { Client, ID, Databases, Storage, Query } from "appwrite";

export class Profile{
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

    async createProfile({userName,bio,location,website,profileImage,userId,twitter,github,linkedIn}){
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteProfileCollectionId,
                userId, // using userId as slug
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
            )
        } catch (error) {
            console.log("Appwrite service :: createProfile :: error", error);
            throw error;
        }
    }

    async updateProfile({userName,bio,location,website,profileImage,userId,twitter,github,linkedIn}){
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteProfileCollectionId,
                userId,
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
            )
        } catch (error) {
            console.log("Appwrite service :: updateProfile :: error", error);
            throw error;
        }
    }

    async getProfile(userId){
        try {
            // console.log("🔍 Getting profile with userId:", userId);
            // console.log("📦 Database ID:", conf.appwriteDatabaseId);
            // console.log("📦 Collection ID:", conf.appwriteProfileCollectionId);
            
            const profile = await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteProfileCollectionId,
                userId
            );
            
            // console.log("✅ Profile fetch successful:", profile);
            return profile;
        } catch (error) {
            console.log("❌ Appwrite service :: getProfile :: error", error);
            // console.log("🔍 Error details:", {
            //     code: error.code,
            //     type: error.type,
            //     message: error.message
            // });
            
            // Don't throw the error, return null for 404s
            if (error.code === 404) {
                return null;
            }
            throw error;
        }
    }

    // Helper methods to track failed attempts (keep these but don't use them for debugging right now)
    getFailedAttempts() {
        const stored = localStorage.getItem('profileFailedAttempts');
        return stored ? JSON.parse(stored) : [];
    }

    addToFailedAttempts(userId) {
        const failed = this.getFailedAttempts();
        if (!failed.includes(userId)) {
            failed.push(userId);
            if (failed.length > 100) {
                failed.splice(0, failed.length - 100);
            }
            localStorage.setItem('profileFailedAttempts', JSON.stringify(failed));
        }
    }

    removeFromFailedAttempts(userId) {
        const failed = this.getFailedAttempts();
        const index = failed.indexOf(userId);
        if (index > -1) {
            failed.splice(index, 1);
            localStorage.setItem('profileFailedAttempts', JSON.stringify(failed));
        }
    }

    clearFailedAttempts() {
        localStorage.removeItem('profileFailedAttempts');
    }

    // file upload service
    async uploadProfileImage(file){
        try {
            return await this.bucket.createFile(
                conf.appwriteBucketId,
                ID.unique(),
                file
            )
        } catch (error) {
            console.log("Appwrite service :: uploadFile :: error", error);
            return false
        }
    }

    async deleteProfileImage(fileId){
        try {
            await this.bucket.deleteFile(
                conf.appwriteBucketId,
                fileId
            )
            return true
        } catch (error) {
            console.log("Appwrite service :: deleteFile :: error", error);
            return false
        }
    }

    getProfileImageView(fileId){
        return this.bucket.getFileView(
            conf.appwriteBucketId,
            fileId
        )
    }
}

const profile = new Profile()
export default profile