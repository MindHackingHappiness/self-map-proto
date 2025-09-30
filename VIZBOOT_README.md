# VizBoot - Self Map Radial Visualization

An interactive web-based radial visualization tool for exploring personal attachment maps with emotional valence and relationship mapping.

## Features

### Core Visualization
- **Radial Positioning**: Choose between valence-based (center = positive) or power-based (center = high power) layouts
- **Valence Coloring**: Automatic color coding from green (positive) through neutral to red (negative)
- **Category Organization**: Five categories with unique symbols
  - People (circle)
  - Accomplishments (square)
  - Life Story (diamond)
  - Ideas/Likes (cross)
  - Other (triangle)

### Interactive Controls
- **Size Metrics**: 
  - Power × |Valence| (default)
  - Power
  - |Valence|
  - Weighted Degree
- **Live Sliders**: Adjust size scale (0.6-1.8x) and opacity (0.35-1.0)
- **Display Options**: Toggle edges and labels on/off
- **Hover Effects**: Rich hover information panels with entry details

### Relationships
- **Affirms**: Green connecting lines (positive associations)
- **Threatens**: Red connecting lines (negative associations)
- **Associates With**: Blue connecting lines (neutral associations)

## Data Format

Upload JSON files with the following structure:

```json
{
  "entries": [
    {
      "label": "Partner",
      "category": "People",
      "power": 0.96,
      "valence": 0.90
    }
  ],
  "associations": [
    {
      "src": "Partner",
      "dst": "Child A",
      "relation": "affirms",
      "weight": 0.95
    }
  ]
}
```

### Field Definitions

**Entries:**
- `label`: Display name for the entry
- `category`: One of "People", "Accomplishments", "Life Story", "Ideas/Likes", "Other"
- `power`: Importance/significance (0-1, where 1 is maximum)
- `valence`: Emotional tone (-1 to +1, where +1 is most positive)

**Associations:**
- `src`: Source entry label
- `dst`: Destination entry label
- `relation`: "affirms", "threatens", or "associates_with"
- `weight`: Strength of connection (0-1)

## Usage

1. **Load Data**: 
   - Click "Load Sample" to see example data
   - Click "Upload JSON" to load your own data file

2. **Explore**:
   - Hover over nodes to see details
   - Use the legend to identify categories
   - Drag to pan, scroll to zoom

3. **Customize**:
   - Select different size metrics to emphasize different aspects
   - Switch between valence and power radius modes
   - Adjust size scale and opacity with sliders
   - Toggle edges and labels as needed

## Technical Details

Built with:
- React + TypeScript
- Plotly.js for interactive visualization
- Tailwind CSS with custom design system
- Radix UI components
- shadcn/ui component library

## Design Philosophy

The visualization uses a cosmic dark theme with glassmorphism effects, emphasizing clarity and interactivity. Colors are semantically meaningful:
- Green spectrum: Positive valence
- Red spectrum: Negative valence
- Gold/amber: Central "Self" reference point
- Semi-transparent overlays: Non-intrusive UI controls

## From Python to Web

This is a web reimplementation of the original `vizboot.py` script, bringing all its powerful features to the browser with enhanced interactivity and a modern interface.
