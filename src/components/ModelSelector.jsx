// src/components/ModelSelector.jsx
import React from 'react'
import './ModelSelector.css'
import { MODELS } from '../modelsConfig'

// Right-side panel that lists all models (2-column grid). Clicking an image switches the model.
export function ModelSelector({ currentModel, onModelChange, brandColor }) {
  // Expose brand color to CSS via a custom property so highlight uses logo color
  const styleVars = { ['--brand-color']: brandColor || '#ff8a33' }
  return (
    <div className="model-selector" style={styleVars}>
      <div className="model-selector-header">
        <h3>Select Model</h3>
      </div>
      <div className="model-options grid-2">
        {MODELS.map((model) => (
          <button
            key={model.id}
            type="button"
            className={`model-option ${currentModel === model.id ? 'active' : ''}`}
            onClick={() => onModelChange(model.id)}
            aria-label={`Open ${model.name}`}
            // Remove default focus outline color (we manage highlight in CSS)
            onMouseDown={(e) => e.currentTarget.blur()}
          >
            <div className="model-image">
              <img src={model.image} alt={model.name} />
            </div>
            <div className="model-name">
              {model.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
