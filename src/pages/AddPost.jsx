import React from 'react'
import { Container, PostForm } from '../components'

function AddPost() {
  return (
    <div className='py-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
        <Container>
            <PostForm />
        </Container>
    </div>
  )
}

export default AddPost