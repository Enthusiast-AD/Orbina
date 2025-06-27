"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useForm } from "react-hook-form"
import { ArrowLeft, Upload, X, Save, Loader2 } from "lucide-react"
import profileService from "../appwrite/profile"
import { Button } from "../components"
import { setProfile } from "../store/profileSlice"
import { updateUserName } from "../store/authSlice"
import { updateProfileUserName } from "../store/profileSlice"
import { profileCacheUtils } from "../utils/profileCache"
import toast from "react-hot-toast"

export default function EditProfile() {
  const { register, handleSubmit, setValue, watch, reset, formState: { isDirty, dirtyFields } } = useForm({
    defaultValues: {
      userName: "",
      bio: "",
      location: "",
      website: "",
      twitter: "",
      github: "",
      linkedIn: "",
    },
  })

  const [previewUrl, setPreviewUrl] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImageChanged, setIsImageChanged] = useState(false)
  const [initialData, setInitialData] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.auth.userData)

  const imageFile = watch("image")

  // Fetch existing profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userData?.$id) return;
      
      setIsLoading(true);
      try {
        console.log("Fetching profile for user:", userData.$id);
        const existingProfile = await profileService.getProfile(userData.$id);
        console.log("Fetched profile:", existingProfile);
        
        if (existingProfile) {
          setProfileData(existingProfile);
          
          const formData = {
            userName: existingProfile.userName || "",
            bio: existingProfile.bio || "",
            location: existingProfile.location || "",
            website: existingProfile.website || "",
            twitter: existingProfile.twitter || "",
            github: existingProfile.github || "",
            linkedIn: existingProfile.linkedIn || "",
          };
          
          setInitialData(formData);
          
          // Set form values
          Object.keys(formData).forEach(key => {
            setValue(key, formData[key]);
          });

          // Set preview image if exists
          if (existingProfile.profileImage) {
            setPreviewUrl(profileService.getProfileImageView(existingProfile.profileImage));
          }
        } else {
          console.log("No existing profile found, will create new one");
          // Set default values for new profile
          const defaultData = {
            userName: userData.name || "",
            bio: "",
            location: "",
            website: "",
            twitter: "",
            github: "",
            linkedIn: "",
          };
          
          setInitialData(defaultData);
          Object.keys(defaultData).forEach(key => {
            setValue(key, defaultData[key]);
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userData, setValue]);

  // Handle image preview
  useEffect(() => {
    if (imageFile && imageFile[0]) {
      const fileReader = new FileReader()
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result)
        setIsImageChanged(true)
      }
      fileReader.readAsDataURL(imageFile[0])
    }
  }, [imageFile])

  const submit = async (data) => {
    if (!userData?.$id) {
      toast.error("User information not available");
      return;
    }

    setIsSubmitting(true)
    
    try {
      console.log("Submitting profile update:", data);
      
      // Handle image upload only if changed
      let imageId = profileData?.profileImage // Keep existing image by default
      
      if (isImageChanged) {
        if (data.image && data.image[0]) {
          try {
            console.log("Uploading new image");
            const file = await profileService.uploadProfileImage(data.image[0])
            if (file) {
              // Delete old image if it exists and upload was successful
              if (profileData?.profileImage) {
                await profileService.deleteProfileImage(profileData.profileImage)
              }
              imageId = file.$id
            }
          } catch (imageError) {
            console.error("Error uploading image:", imageError)
            toast.error("Failed to upload image. Other changes will still be saved.")
          }
        } else {
          // User wants to remove image
          if (profileData?.profileImage) {
            await profileService.deleteProfileImage(profileData.profileImage)
          }
          imageId = null
        }
      }

      // Prepare payload
      const payload = {
        userId: userData.$id,
        userName: data.userName || "",
        bio: data.bio || "",
        location: data.location || "",
        website: data.website || "",
        twitter: data.twitter || "",
        github: data.github || "",
        linkedIn: data.linkedIn || "",
        profileImage: imageId,
      }

      console.log("Profile payload:", payload);

      // Update or create profile
      let result;
      if (profileData) {
        console.log("Updating existing profile");
        result = await profileService.updateProfile(payload);
      } else {
        console.log("Creating new profile");
        result = await profileService.createProfile(payload);
      }

      if (result) {
        console.log("Profile saved successfully:", result);
        
        // Update Redux store
        dispatch(setProfile(result))
        dispatch(updateProfileUserName(result.userName))
        dispatch(updateUserName(result.userName))
        
        // Clear cache
        profileService.removeFromFailedAttempts(userData.$id)
        profileCacheUtils.clearSpecificProfile(userData.$id)
        
        toast.success("Profile updated successfully!")
        navigate("/profile")
      } else {
        throw new Error("Unable to save profile.")
      }
    } catch (error) {
      console.error("Profile save error:", error)
      toast.error(`Failed to update profile: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate("/profile")
  }

  const removeImage = () => {
    setPreviewUrl(null)
    setValue("image", null)
    setIsImageChanged(true) // Mark as changed to remove existing image
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading profile data...</p>
        </div>
      </div>
    )
  }

  // Check if anything has changed
  const hasChanges = isDirty || isImageChanged

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/profile")}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
                <p className="text-slate-400">
                  {hasChanges ? "You have unsaved changes" : "Update your profile information"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={handleCancel}
                className="bg-slate-700 hover:bg-slate-600 text-white border-0"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit(submit)}
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit(submit)} className="space-y-8">
          {/* Profile Image Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-6">Profile Picture</h2>
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30 bg-slate-700">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Upload className="w-8 h-8" />
                    </div>
                  )}
                </div>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <label className="block">
                  <span className="text-sm font-medium text-slate-300 mb-2 block">
                    {previewUrl ? "Change Image" : "Upload New Image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer cursor-pointer"
                    {...register("image")}
                  />
                </label>
                <p className="text-xs text-slate-400 mt-2">
                  Recommended: Square image, at least 400x400px. JPG, PNG, or GIF (max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Display Name *</label>
                <input
                  type="text"
                  placeholder="Your display name"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  {...register("userName", { required: true })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Your location"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  {...register("location")}
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
              <textarea
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                {...register("bio")}
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-6">Social Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Website</label>
                <input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  {...register("website")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Twitter</label>
                <input
                  type="text"
                  placeholder="@yourhandle"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  {...register("twitter")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">GitHub</label>
                <input
                  type="text"
                  placeholder="githubusername"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  {...register("github")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn</label>
                <input
                  type="text"
                  placeholder="linkedinusername"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  {...register("linkedIn")}
                />
              </div>
            </div>
          </div>

          {/* Account Information (Read-only) */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-6">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={userData?.name || ""}
                  disabled
                  className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={userData?.email || ""}
                  disabled
                  className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Account information cannot be changed from this page.</p>
          </div>
        </form>
      </div>
    </div>
  )
}