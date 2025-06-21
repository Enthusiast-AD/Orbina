import React from 'react'
import appwriteService from "../appwrite/config"
import {Link} from 'react-router-dom'
import parse from 'html-react-parser'

function PostCard({$id, title, featuredImage,content,userName}) {
    
  return (
    <Link to={`/post/${$id}`}>
        <div className='rounded-lg text-card-foreground group overflow-hidden border-0 shadow-lg hover:shadow-xl shadow-gray-900/20 hover:shadow-gray-900/40 transition-all duration-300  bg-gray-800 cursor-pointer'>
            <div className='relative overflow-hidden'>
                <img src={appwriteService.getFileView(featuredImage)} alt={title}
                className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300' />

            </div>
            <div className='p-6'>
            <h3
            className='text-xl font-bold  text-gray-100 mb-2  group-hover:text-purple-400 transition-colors line-clamp-2'
            >{title}</h3>
            <p className=' text-gray-400 mb-4 line-clamp-2'>
              {parse(content)}
            </p>
            <div className="flex items-center justify-between">
                <div className='flex items-center space-x-3'>
                  <div>
                    <p className='text-sm font-medium  text-gray-100'>{userName}</p>
                  </div>
                </div>
            </div>
            </div>
        </div>
    </Link>
  )
}


export default PostCard