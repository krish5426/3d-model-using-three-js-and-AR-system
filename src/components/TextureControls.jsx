import React from 'react'
import './TextureControls.css'

function TextureControls({ currentTexture, onTextureChange }) {
  const textureButtons = [
    { id: 'texture_1', image: '/images/1.png' },
    { id: 'texture_2', image: '/images/2.png' },
    { id: 'texture_3', image: '/images/3.png' },
    { id: 'texture_4', image: '/images/4.png' },
    { id: 'texture_5', image: '/images/5.png' }
  ]

  return (
    <div className="texture-controls">
      <div className="texture-buttons">
        {textureButtons.map((button) => (
          <div
            key={button.id}
            className={`texture-btn ${currentTexture === button.id ? 'active' : ''}`}
            //onClick={() => onTextureChange(button.id)}
            style={{ backgroundImage: `url(${button.image})` }}
          />
        ))}
      </div>
    </div>
  )
}

export default TextureControls
