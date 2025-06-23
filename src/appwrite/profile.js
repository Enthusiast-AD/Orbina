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
        }
    }

    // async deleteProfile(userId){
    //     try {
    //         await this.databases.deleteDocument(
    //             conf.appwriteDatabaseId,
    //             conf.appwriteCollectionId,
    //             userId
    //         )
    //         return true
    //     } catch (error) {
    //         console.log("Appwrite service :: deleteProfile :: error", error);
    //         return false
    //     }
    // }

    async getProfile(userId){
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteProfileCollectionId,
                userId

            )
        } catch (error) {
            console.log("Appwrite service :: getProfile :: error", error);
            return false
        }
    }

    // async getPosts(queries = [Query.equal("status", "active")]){
    //     try {
    //         return await this.databases.listDocuments(
    //             conf.appwriteDatabaseId,
    //             conf.appwriteCollectionId,
    //             queries,
                

    //         )
    //     } catch (error) {
    //         console.log("Appwrite service :: getPosts :: error", error);
    //         return false
    //     }
    // }

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
    // async getFile(fileId){
    //     try {
    //         await this.bucket.getFile(
    //             conf.appwriteBucketId,
    //             fileId
    //         )
    //         return true
    //     } catch (error) {
    //         console.log("Appwrite service :: getFile :: error", error);
    //         return false
    //     }
    // }

    // getFilePreview(fileId){
    //     return this.bucket.getFilePreview(
    //         conf.appwriteBucketId,
    //         fileId
    //     )
    // }
    getProfileImageView(fileId){
        return this.bucket.getFileView(
            conf.appwriteBucketId,
            fileId
        )
    }
}


const profile = new Profile()
export default profile