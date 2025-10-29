// src/modelsConfig.js
// This config drives the right-side panel and dynamic model loading.
// - id: unique key for the model
// - name: label shown in the panel
// - image: path under public/ used for the thumbnail
// - componentPath: relative path to the JSX component exporting `Model`

export const MODELS = [
  // Base examples
  { id: 'bedside', name: 'Bedside Panel', image: '/images/BedsidePanel.jpg', componentPath: './BedsidePanel.jsx' },
  { id: 'studydesk', name: 'Study Desk', image: '/images/Studydesk.jpg', componentPath: './Studydesk.jsx' },

  // Discovered models (ensure componentPath matches the filename exactly)
  { id: 'clothrack', name: 'Cloth Rack', image: '/images/clothrack.jpg', componentPath: './Clothrack.jsx' },
  { id: 'duo-dining-table', name: 'Dining Table (with 2 chairs)', image: '/images/duo-dining-tableblend.jpg', componentPath: './duo-dining-table.jsx' },
  { id: 'headboard', name: 'Headboard', image: '/images/headboard.jpg', componentPath: './headboard.jsx' },
  { id: 'joint-unit', name: 'Joint Unit', image: '/images/joint-unit.jpg', componentPath: './JointUnit.jsx' },
  { id: 'luggage-bench', name: 'Luggage Bench', image: '/images/luggage-bench.jpg', componentPath: './liggagebench.jsx' },
  { id: 'microfridge', name: 'Micro Fridge', image: '/images/microfridge.jpg', componentPath: './microrfidge.jsx' },
  { id: 'side-table', name: 'Side Table', image: '/images/side-table.jpg', componentPath: './sidetable.jsx' },
  { id: 'tv-panel', name: 'TV Panel', image: '/images/tv-panel.jpg', componentPath: './t.vpanel.jsx' },

  // If a model doesn't have a JSX component, you can specify a GLB in public/ instead:
  // { id: 'media-unit', name: 'Media Unit', image: '/images/media-unit.jpg', modelPath: '/mediaunit.glb' },
]


