"use client"

import React from "react"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { ArrowLeft, Upload, X, Eye, Save, Plus, ImageIcon, FileText, Settings, AlertCircle, Crop } from "lucide-react"
import { Button, RTE } from "../../components"
import appwriteService from "../../appwrite/config"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"

export default function PostForm({ post }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState(
    post?.featuredImage ? appwriteService.getFileView(post.featuredImage) : null,
  )
  const [imageError, setImageError] = useState(false)
  const [originalImageDimensions, setOriginalImageDimensions] = useState(null)
  const [processedImageFile, setProcessedImageFile] = useState(null)
  const [originalImageFile, setOriginalImageFile] = useState(null)

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

  const blobToFile = useCallback((blob, fileName) => {
    const file = new File([blob], fileName, {
      type: blob.type,
      lastModified: Date.now(),
    })
    return file
  }, [])

  const processImage = useCallback((file) => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
          try {
            setOriginalImageDimensions({ width: img.width, height: img.height })

            const targetWidth = 1200
            const targetHeight = 630
            const targetRatio = targetWidth / targetHeight

            let sourceWidth = img.width
            let sourceHeight = img.height
            let sourceX = 0
            let sourceY = 0

            const sourceRatio = sourceWidth / sourceHeight

            if (sourceRatio > targetRatio) {
              sourceWidth = sourceHeight * targetRatio
              sourceX = (img.width - sourceWidth) / 2
            } else {
              sourceHeight = sourceWidth / targetRatio
              sourceY = (img.height - sourceHeight) / 2
            }

            canvas.width = targetWidth
            canvas.height = targetHeight

            ctx.drawImage(
              img,
              sourceX, sourceY, sourceWidth, sourceHeight,
              0, 0, targetWidth, targetHeight
            )

            canvas.toBlob((blob) => {
              if (blob) {
                const fileName = file.name.replace(/\.[^/.]+$/, "") + "_optimized.jpg"
                const processedFile = blobToFile(blob, fileName)
                resolve(processedFile)
              } else {
                reject(new Error("Failed to process image"))
              }
            }, 'image/jpeg', 0.85)
          } catch (error) {
            reject(error)
          }
        }

        img.onerror = () => {
          reject(new Error("Failed to load image"))
        }

        img.src = URL.createObjectURL(file)
      } catch (error) {
        reject(error)
      }
    })
  }, [blobToFile])

  React.useEffect(() => {
    if (watchedImage && watchedImage[0]) {
      const file = watchedImage[0]
      
      if (!file.type.startsWith('image/')) {
        setImageError("Please select a valid image file")
        setProcessedImageFile(null)
        setOriginalImageFile(null)
        toast.error("Please select a valid image file")
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setImageError("Image size should be less than 10MB")
        setProcessedImageFile(null)
        setOriginalImageFile(null)
        toast.error("Image size should be less than 10MB")
        return
      }

      setImageError(false)
      setOriginalImageFile(file)

      toast.promise(
        processImage(file),
        {
          loading: 'Processing image...',
          success: 'Image processed successfully!',
          error: 'Failed to process image'
        }
      ).then((processedFile) => {
        setProcessedImageFile(processedFile)
        const reader = new FileReader()
        reader.onload = () => setImagePreview(reader.result)
        reader.readAsDataURL(processedFile)
      }).catch((error) => {
        console.error("Error processing image:", error)
        setImageError("Failed to process image. Using original file.")
        setProcessedImageFile(file)
        const reader = new FileReader()
        reader.onload = () => setImagePreview(reader.result)
        reader.readAsDataURL(file)
      })
    }
  }, [watchedImage, processImage])

  const submit = async (data) => {
    setIsSubmitting(true)

    const submitPromise = async () => {
      if (post) {
        let file = null
        if (processedImageFile) {
          try {
            file = await appwriteService.uploadFile(processedImageFile)
            if (file && post.featuredImage) {
              await appwriteService.deleteFile(post.featuredImage)
            }
          } catch (uploadError) {
            console.error("Error uploading processed image:", uploadError)
            if (originalImageFile) {
              file = await appwriteService.uploadFile(originalImageFile)
              if (file && post.featuredImage) {
                await appwriteService.deleteFile(post.featuredImage)
              }
            } else {
              throw uploadError
            }
          }
        }

        const dbPost = await appwriteService.updatePost(post.$id, {
          ...data,
          featuredImage: file ? file.$id : post.featuredImage,
        })

        if (dbPost) {
          navigate(`/post/${dbPost.$id}`)
          return "Post updated successfully!"
        }
      } else {
        if (!processedImageFile && !originalImageFile) {
          throw new Error("Featured image is required")
        }

        let file = null
        try {
          file = await appwriteService.uploadFile(processedImageFile || originalImageFile)
        } catch (uploadError) {
          console.error("Error uploading processed image:", uploadError)
          if (originalImageFile && processedImageFile !== originalImageFile) {
            file = await appwriteService.uploadFile(originalImageFile)
          } else {
            throw uploadError
          }
        }
        
        if (file) {
          const dbPost = await appwriteService.createPost({
            ...data,
            featuredImage: file.$id,
            userId: userData.$id,
            userName: userData.name,
          })

          if (dbPost) {
            navigate(`/post/${dbPost.$id}`)
            return "Post published successfully!"
          }
        } else {
          throw new Error("Failed to upload image")
        }
      }
    }

    try {
      await toast.promise(
        submitPromise(),
        {
          loading: post ? 'Updating post...' : 'Publishing post...',
          success: (message) => message,
          error: (error) => `Failed to ${post ? 'update' : 'create'} post: ${error.message}`
        }
      )
    } catch (error) {
      console.error("Error submitting post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string") {
      const transformed = value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s/g, "-")
        .slice(0, 35)

      return transformed
    }
    return ""
  }, [])

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        const newSlug = slugTransform(value.title)
        setValue("slug", newSlug, { shouldValidate: true })
        
        if (newSlug.length >= 35) {
          toast.warning("Slug truncated to 35 characters for optimal compatibility")
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [watch, slugTransform, setValue])

  const handleSlugInput = (e) => {
    const inputValue = e.currentTarget.value
    const transformedSlug = slugTransform(inputValue)
    setValue("slug", transformedSlug, { shouldValidate: true })
    
    if (inputValue.length > 35) {
      toast.warning("Slug cannot exceed 35 characters")
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setProcessedImageFile(null)
    setOriginalImageFile(null)
    setOriginalImageDimensions(null)
    setValue("image", null)
    setImageError(false)
    toast.success("Image removed")
  }

  const hasImage = processedImageFile || originalImageFile

  return (
    <div className="min-h-screen">
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit(submit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Slug * 
                    <span className="text-slate-400 text-xs ml-2">
                      ({watch("slug")?.length || 0}/35 characters)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="post-url-slug"
                    maxLength={35}
                    className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.slug ? "border-red-500" : "border-slate-600"
                    }`}
                    {...register("slug", { 
                      required: "Slug is required",
                      maxLength: { value: 35, message: "Slug cannot exceed 35 characters" }
                    })}
                    onInput={handleSlugInput}
                  />
                  {errors.slug && <p className="text-red-400 text-sm mt-1">{errors.slug.message}</p>}
                  <p className="text-slate-400 text-xs mt-1">
                    URL-friendly version of the title (max 35 characters)
                  </p>
                </div>
              </div>
            </div>

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

          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Featured Image</h2>
              </div>

              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <div className="aspect-[1.91/1] w-full bg-slate-700 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <div className="mt-2 p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Crop className="w-4 h-4 text-green-400" />
                        <span>Optimized: 1200×630px (Perfect for sharing)</span>
                      </div>
                      {originalImageDimensions && (
                        <p className="text-xs text-slate-400 mt-1">
                          Original: {originalImageDimensions.width}×{originalImageDimensions.height}px
                        </p>
                      )}
                      {processedImageFile && (
                        <p className="text-xs text-green-400 mt-1">
                          ✓ Image processed and ready for upload
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[1.91/1] border-2 border-dashed border-slate-600 rounded-lg p-8 text-center bg-slate-700/20">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 mb-2">Upload featured image</p>
                    <p className="text-slate-500 text-sm mb-3">
                      Recommended: 1200×630px or similar ratio
                    </p>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>• Auto-optimized to 1200×630px</p>
                      <p>• Supports JPG, PNG, WebP</p>
                      <p>• Max size: 10MB</p>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/png, image/jpg, image/jpeg, image/gif, image/webp"
                  className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer cursor-pointer"
                  {...register("image", { required: !post ? "Featured image is required" : false })}
                />
                
                {imageError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{imageError}</p>
                  </div>
                )}
                
                {errors.image && (
                  <p className="text-red-400 text-sm">{errors.image.message}</p>
                )}

                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-300 font-medium text-sm mb-2">📸 Image Guidelines</h4>
                  <ul className="text-blue-200 text-xs space-y-1">
                    <li>• Images auto-resize to 1200×630px (1.91:1 ratio)</li>
                    <li>• Use high-quality images for best results</li>
                    <li>• Avoid text-heavy images as they may be cropped</li>
                  </ul>
                </div>
              </div>
            </div>

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

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting || (!post && !hasImage)}
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