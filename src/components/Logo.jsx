import React from 'react'

function Logo({width = '100px'}) {
  return (
    <div className='text-foreground font-bold text-2xl' style={{width}}>
      Orbina
    </div>
  )
}

export default Logo
