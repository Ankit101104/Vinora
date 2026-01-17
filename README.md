# Electronics Block Diagram Generator

An interactive web-based application for generating editable block diagrams of electronics products from natural language descriptions. Built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

1. **Natural Language Input**: Accept text descriptions of electronics products (e.g., "smart doorbell with camera and motion sensor")
2. **Automatic Diagram Generation**: Generates structured diagrams with exactly five sections:
   - Power Supply
   - Inputs Block
   - Control and Processing Block
   - Outputs Block
   - Other Peripherals
3. **Interactive Editing**: 
   - Add, remove, and modify blocks
   - Create connections between components
   - Add annotations/comments
   - Drag and drop elements
4. **Export Functionality**: Export diagrams in multiple formats:
   - JSON (structured data)
   - SVG (vector graphics)
   - Draw.io XML format

## Tech Stack

- **Frontend**: React 18, Fabric.js (canvas library)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **AI/ML**: Google Gemini API for natural language processing
- **Styling**: CSS3 with modern gradients and responsive design

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote instance)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Vinora
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/vinora
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   ```

   **Getting Gemini API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the API key and add it to your `.env` file
   
   **Note:** If you don't provide a Gemini API key, the system will fall back to pattern-based matching (less accurate but still functional).

5. **Start MongoDB**
   
   Make sure MongoDB is running on your system. If using a local instance:
   ```bash
   mongod
   ```

6. **Run the application**

   **Development mode** (runs both server and client):
   ```bash
   # Terminal 1 - Start backend server
   npm run dev

   # Terminal 2 - Start React frontend
   npm run client
   ```

   The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
Vinora/
├── server.js                 # Express server entry point
├── package.json              # Backend dependencies
├── models/
│   └── Diagram.js           # MongoDB schema for diagrams
├── routes/
│   └── diagrams.js          # API routes for diagram operations
├── services/
│   └── diagramGenerator.js  # NLP parsing and diagram generation logic
└── client/                  # React frontend
    ├── public/
    ├── src/
    │   ├── App.js           # Main React component
    │   ├── components/
    │   │   ├── DiagramCanvas.js    # Fabric.js canvas implementation
    │   │   ├── InputSection.js     # Text input component
    │   │   ├── Toolbar.js          # Toolbar with actions
    │   │   └── PropertiesPanel.js  # Element properties editor
    │   └── index.js
    └── package.json
```

## API Endpoints

- `POST /api/diagrams/generate` - Generate diagram from description
- `GET /api/diagrams` - Get all diagrams
- `GET /api/diagrams/:id` - Get diagram by ID
- `PUT /api/diagrams/:id` - Update diagram
- `DELETE /api/diagrams/:id` - Delete diagram
- `GET /api/diagrams/:id/export/json` - Export diagram as JSON

## How It Works

### Diagram Generation Logic

The `DiagramGenerator` service uses **Google Gemini AI** to intelligently parse and understand electronics product descriptions:

1. **AI-Powered Analysis**: Uses Gemini AI to understand the product description and identify electronics components
2. **Intelligent Categorization**: Gemini categorizes components into one of the five required sections based on electronics engineering knowledge:
   - **Power Supply**: battery, power supply, voltage regulator, etc.
   - **Inputs**: sensors, cameras, buttons, switches, etc.
   - **Control/Processing**: microcontrollers, processors, CPUs, etc.
   - **Outputs**: displays, LEDs, speakers, motors, etc.
   - **Peripherals**: WiFi, Bluetooth, memory, storage, etc.
3. **Layout Calculation**: Blocks are positioned in a horizontal layout with each section taking 1/5 of the canvas width
4. **Connection Generation**: Default connections are created between logical sections (e.g., Power → Control → Outputs)

### Component Placement Algorithm

The layout algorithm uses the following approach:

- **Horizontal Section Layout**: Five sections arranged left-to-right, each taking 1/5 of canvas width (1200px)
- **Vertical Block Stacking**: Within each section, blocks are stacked vertically with spacing
- **Centered Alignment**: The entire block group is vertically centered in the canvas
- **Coordinate Calculation**: 
  ```
  sectionX = sectionIndex * (canvasWidth / 5) + padding
  blockY = (canvasHeight / 2) - (maxBlocks * (blockHeight + spacing)) / 2
  ```

This ensures:
- Clear visual separation between sections
- Consistent spacing and alignment
- Scalable layout that works with varying numbers of blocks per section

## Usage Example

1. Enter a description: "smart doorbell with camera and motion sensor"
2. Click "Generate Diagram"
3. The system will:
   - Extract: camera, motion sensor
   - Categorize: camera → Inputs, motion sensor → Inputs
   - Generate blocks in appropriate sections
   - Create connections between sections
4. Edit the diagram:
   - Click on blocks to select and modify
   - Use toolbar to add new blocks/connections/annotations
   - Drag elements to reposition
5. Export in desired format

## Data Structure

Diagrams are stored as JSON documents with the following structure:

```json
{
  "title": "Untitled Diagram",
  "description": "smart doorbell with camera",
  "sections": [
    {
      "id": "power",
      "name": "Power Supply",
      "blocks": ["Battery"]
    },
    ...
  ],
  "blocks": [
    {
      "id": "block_power_0",
      "sectionId": "power",
      "name": "Battery",
      "x": 20,
      "y": 350,
      "width": 216,
      "height": 60
    },
    ...
  ],
  "connections": [
    {
      "id": "conn1",
      "from": "power",
      "to": "control",
      "label": "Power"
    },
    ...
  ],
  "annotations": [...],
  "metadata": {
    "originalDescription": "...",
    "generatedAt": "2024-..."
  }
}
```

## Future Enhancements

- AI/ML integration for better component recognition
- More export formats (PDF, PNG)
- Collaborative editing
- Diagram templates
- Advanced connection routing
- Component library with icons

## License

MIT
