"use client"

import React from "react"

import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { ArrowLeft, Upload, X, Eye, Save, Plus, ImageIcon, FileText, Settings, AlertCircle } from "lucide-react"
import { Button, RTE } from "../../components"
import appwriteService from "../../appwrite/config"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"

export default function PostForm({ post }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState(
    post?.featuredImage ? appwriteService.getFileView(post.featuredImage) : null,
  )
  const [imageError, setImageError] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    getValues,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      title: post?.title || "",
      slug: post?.$id || "",
      content: post?.content || "",
      status: post?.status || "active",
    },
  })

  const navigate = useNavigate()
  const userData = useSelector((state) => state.auth.userData)

  const watchedImage = watch("image")

  // Handle image preview
  React.useEffect(() => {
    if (watchedImage && watchedImage[0]) {
      const file = watchedImage[0]
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
      setImageError(false)
    }
  }, [watchedImage])

  const submit = async (data) => {
    setIsSubmitting(true)

    try {
      if (post) {
        // Update existing post
        const file = data.image && data.image[0] ? await appwriteService.uploadFile(data.image[0]) : null

        if (file) {
          appwriteService.deleteFile(post.featuredImage)
        }

        const dbPost = await appwriteService.updatePost(post.$id, {
          ...data,
          featuredImage: file ? file.$id : post.featuredImage,
        })

        if (dbPost) {
          navigate(`/post/${dbPost.$id}`)
        }
      } else {
        // Create new post
        const file = data.image && data.image[0] ? await appwriteService.uploadFile(data.image[0]) : null

        if (file) {
          const fileId = file.$id
          data.featuredImage = fileId
          const dbPost = await appwriteService.createPost({
            ...data,
            userId: userData.$id,
            userName: userData.name,
          })

          if (dbPost) {
            navigate(`/post/${dbPost.$id}`)
          }
        }
      }
    } catch (error) {
      console.error("Error submitting post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string")
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s/g, "-")

    return ""
  }, [])

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [watch, slugTransform, setValue])

  const removeImage = () => {
    setImagePreview(null)
    setValue("image", null)
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{post ? "Edit Post" : "Create New Post"}</h1>
                <p className="text-slate-400">
                  {post ? "Update your existing post" : "Share your thoughts with the world"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isDirty && (
                <span className="text-sm text-yellow-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Unsaved changes
                </span>
              )}
              <Button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-slate-700 hover:bg-slate-600 text-white border-0"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit(submit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Post Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                  <input
                    type="text"
                    placeholder="Enter your post title..."
                    className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.title ? "border-red-500" : "border-slate-600"
                    }`}
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Slug *</label>
                  <input
                    type="text"
                    placeholder="post-url-slug"
                    className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.slug ? "border-red-500" : "border-slate-600"
                    }`}
                    {...register("slug", { required: "Slug is required" })}
                    onInput={(e) => {
                      setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true })
                    }}
                  />
                  {errors.slug && <p className="text-red-400 text-sm mt-1">{errors.slug.message}</p>}
                  <p className="text-slate-400 text-xs mt-1">URL-friendly version of the title</p>
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Content</h2>
              </div>

              <div className="min-h-96">
                <RTE label="" name="content" control={control} defaultValue={getValues("content")} />
              </div>
            </div>
          </div>

          {/* Right Column - Settings & Preview */}
          <div className="space-y-6">
            {/* Featured Image */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Featured Image</h2>
              </div>

              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={() => setImageError(true)}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 mb-2">Upload featured image</p>
                    <p className="text-slate-500 text-sm">PNG, JPG, JPEG, GIF up to 10MB</p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/png, image/jpg, image/jpeg, image/gif"
                  className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer cursor-pointer"
                  {...register("image", { required: !post ? "Featured image is required" : false })}
                />
                {errors.image && <p className="text-red-400 text-sm">{errors.image.message}</p>}
              </div>
            </div>

            {/* Post Settings */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Settings</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    {...register("status", { required: true })}
                  >
                    <option value="active">Published</option>
                    <option value="inactive">Draft</option>
                  </select>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-2">Author</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{userData?.name?.charAt(0) || "U"}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{userData?.name || "User"}</p>
                      <p className="text-slate-400 text-xs">{userData?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                  post ? "bg-green-600 hover:bg-green-700 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {post ? "Updating..." : "Publishing..."}
                  </>
                ) : (
                  <>
                    {post ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {post ? "Update Post" : "Publish Post"}
                  </>
                )}
              </Button>

              {post && (
                <Button
                  type="button"
                  onClick={() => navigate(`/post/${post.$id}`)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Preview Post
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
