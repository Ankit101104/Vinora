# Vinora - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Installation & Setup](#installation--setup)
4. [Project Structure](#project-structure)
5. [Backend API](#backend-api)
6. [Frontend Components](#frontend-components)
7. [Database Schema](#database-schema)
8. [Architecture & Design](#architecture--design)
9. [AI Integration (Gemini)](#ai-integration-gemini)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)
12. [Development Tips](#development-tips)

---

## Project Overview

**Vinora** is an interactive web-based application for generating editable block diagrams of electronics products from natural language descriptions.

### Key Features

- **Natural Language Input**: Convert text descriptions into structured electronics diagrams
- **Automatic AI-Powered Generation**: Uses Google Gemini API to intelligently parse product descriptions
- **Interactive Editing**: Add, modify, and delete blocks; create connections; add annotations
- **Multiple Export Formats**: JSON, SVG, and Draw.io XML
- **Real-time Canvas Rendering**: Fabric.js-based interactive canvas
- **Persistent Storage**: MongoDB for diagram history and management

### Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Fabric.js, CSS3 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **AI** | Google Gemini API |
| **Package Managers** | npm, npm scripts |

---

## Quick Start

### Prerequisites
- Node.js v14+
- MongoDB (local or Atlas)
- Google Gemini API key

### 5-Minute Setup

```bash
# Clone and install
git clone <repository-url>
cd Vinora
npm install

# Backend setup
echo "MONGODB_URI=mongodb://localhost:27017/vinora" > .env
echo "GEMINI_API_KEY=your_key_here" >> .env

# Frontend setup
cd client && npm install && cd ..

# Start both servers
npm start              # Terminal 1 - Backend (port 5000)
cd client && npm start # Terminal 2 - Frontend (port 3000)
```

Open `http://localhost:3000` in browser.

---

## Installation & Setup

### Step 1: Environment Configuration

Create `.env` file in project root:
```env
MONGODB_URI=mongodb://localhost:27017/vinora
GEMINI_API_KEY=AIzaXxxxxxxxxxxxxxxxxxxxx
NODE_ENV=development
PORT=5000
```

### Step 2: Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Click "Create API key"
3. Copy and paste into `.env`

### Step 3: MongoDB Setup

**Option A: Local MongoDB**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Windows
# Download from mongodb.com and install

# Linux
sudo apt-get install mongodb-org
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/vinora
```

### Step 4: Install Dependencies

```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### Step 5: Start Application

**Terminal 1 - Backend:**
```bash
npm start
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```
Frontend runs on `http://localhost:3000`

---

## Project Structure

```
Vinora/
├── server.js                      # Express server entry point
├── package.json                   # Backend dependencies
├── .env                          # Environment variables
├── .env.example                  # Environment template
│
├── models/
│   └── Diagram.js                # MongoDB schema for diagrams
│
├── routes/
│   └── diagrams.js               # API endpoints
│
├── services/
│   └── diagramGenerator.js        # Core diagram generation logic
│
└── client/                        # React frontend
    ├── package.json              # Frontend dependencies
    ├── public/
    │   └── index.html            # HTML template
    └── src/
        ├── App.js                # Root React component
        ├── index.js              # React entry point
        ├── App.css               # Main styles
        ├── index.css             # Global styles
        └── components/
            ├── InputSection.js    # Text input for description
            ├── DiagramCanvas.js   # Canvas rendering & editing
            ├── Toolbar.js         # Action buttons
            ├── PropertiesPanel.js # Block properties editor
            └── SolutionPanel.js   # AI solution text display
```

---

## Backend API

### Base URL
```
http://localhost:5000/api/diagrams
```

### Authentication
Currently no authentication. Add JWT if needed for production.

### Endpoints

#### 1. Health Check
```
GET /health
```
**Response:**
```json
{
  "status": "ok"
}
```

#### 2. Generate Diagram from Description
```
POST /api/diagrams/generate
Content-Type: application/json

{
  "description": "Smart doorbell with camera and motion sensor"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "description": "Smart doorbell with camera and motion sensor",
  "sections": [
    {
      "id": "power",
      "name": "Power Supply",
      "blocks": ["AC Adapter", "5V Regulator"],
      "blockSpecs": {
        "AC Adapter": "100-240V input",
        "5V Regulator": "5V 2A output"
      },
      "details": "Provides power to all components"
    },
    {
      "id": "inputs",
      "name": "Inputs Block",
      "blocks": ["Motion Sensor", "Camera"],
      "blockSpecs": {
        "Motion Sensor": "PIR sensor, 5m range",
        "Camera": "1080p@30fps"
      },
      "details": "Receives sensor inputs"
    },
    // ... other sections
  ],
  "blocks": [
    {
      "id": "block_0_0",
      "name": "AC Adapter",
      "section": "power",
      "x": 20,
      "y": 100,
      "width": 180,
      "height": 60,
      "specification": "100-240V input"
    },
    // ... more blocks
  ],
  "connections": [
    {
      "fromBlock": "block_0_0",
      "toBlock": "block_2_0",
      "label": "Power"
    }
  ],
  "annotations": [],
  "metadata": {
    "originalDescription": "Smart doorbell...",
    "generatedAt": "2024-01-17T10:30:00.000Z",
    "generatedBy": "gemini-api",
    "solution": "This system integrates..."
  },
  "createdAt": "2024-01-17T10:30:00.000Z",
  "updatedAt": "2024-01-17T10:30:00.000Z"
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing description
- `500`: Server error / API failure

#### 3. Get All Diagrams
```
GET /api/diagrams
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "description": "Smart doorbell...",
    "sections": [...],
    "createdAt": "2024-01-17T10:30:00.000Z",
    ...
  },
  // ... more diagrams
]
```

#### 4. Get Single Diagram
```
GET /api/diagrams/:id
```

**Response:** Full diagram object (same as POST /generate)

#### 5. Update Diagram
```
PUT /api/diagrams/:id
Content-Type: application/json

{
  "blocks": [...],
  "connections": [...],
  "annotations": [...],
  "title": "Updated Title"
}
```

**Response:** Updated diagram object

#### 6. Delete Diagram
```
DELETE /api/diagrams/:id
```

**Response:**
```json
{
  "message": "Diagram deleted successfully"
}
```

#### 7. Export as JSON
```
GET /api/diagrams/:id/export/json
```
Downloads diagram as JSON file.

#### 8. Export as SVG
```
GET /api/diagrams/:id/export/svg
```
Downloads diagram as vector graphic.

#### 9. Export as Draw.io XML
```
GET /api/diagrams/:id/export/drawio
```
Downloads editable Draw.io format.

### Example API Usage with cURL

```bash
# Generate diagram
curl -X POST http://localhost:5000/api/diagrams/generate \
  -H "Content-Type: application/json" \
  -d '{"description":"Smart home hub with WiFi and Bluetooth"}'

# Get all diagrams
curl http://localhost:5000/api/diagrams

# Update a diagram
curl -X PUT http://localhost:5000/api/diagrams/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"blocks":[...]}'

# Export as JSON
curl http://localhost:5000/api/diagrams/507f1f77bcf86cd799439011/export/json > diagram.json
```

---

## Frontend Components

### App.js (Root Component)

**State:**
```javascript
const [diagram, setDiagram] = useState(null);          // Current diagram
const [selectedBlock, setSelectedBlock] = useState(null); // Active block
const [loading, setLoading] = useState(false);         // API loading state
```

**Main Methods:**

| Method | Purpose | Parameters |
|--------|---------|-----------|
| `handleGenerate(description)` | Generate diagram from text | string |
| `handleUpdateDiagram(diagram)` | Save diagram changes | object |
| `handleAddBlock(section, blockData)` | Add new block | section id, block object |
| `handleDeleteBlock(blockId)` | Remove block | string |
| `handleAddConnection(blockIds)` | Connect blocks | [fromId, toId] |
| `handleAddAnnotation(text, x, y)` | Add comment | string, number, number |
| `handleExport(format)` | Download diagram | 'json' \| 'svg' \| 'drawio' |

### InputSection.js

Accepts product description text input.

**Props:**
- `onGenerate: (description: string) => void`

**Features:**
- Character counter
- "Generate Diagram" button
- Auto-clears on new generation

### DiagramCanvas.js

Renders and manages interactive canvas using Fabric.js.

**Props:**
```javascript
{
  diagram: {
    sections: Array,
    blocks: Array,
    connections: Array,
    annotations: Array,
    metadata: Object
  },
  onSelectBlock: Function,
  onUpdateDiagram: Function,
  onAddBlock: Function
}
```

**Canvas Features:**
- 5 section columns (Power, Inputs, Control, Outputs, Peripherals)
- Draggable blocks
- Connection lines with labels
- Text annotations
- Real-time rendering

**Block Layout:**
```
┌─────────────────┐
│  Section Label  │
├─────────────────┤
│ ┌─────────────┐ │
│ │   Battery   │ │
│ │ 5V 2A Li-Ion│ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │   Charger   │ │
│ │   USB Type-C│ │
│ └─────────────┘ │
└─────────────────┘
```

### Toolbar.js

Action buttons for diagram manipulation.

**Buttons:**
- Add Block
- Connect Blocks
- Add Annotation
- Delete Block
- Export SVG
- Export JSON
- Export Draw.io

### PropertiesPanel.js

Edit properties of selected block.

**Editable Fields:**
- Block Name (max 20 chars)
- Specification (technical details)
- Section (read-only)

### SolutionPanel.js

Display AI-generated explanation of system design.

**Content:**
- System overview
- Component integration
- Data flow explanation

---

## Database Schema

### Diagram Collection

```javascript
{
  _id: ObjectId,
  title: String (default: "Untitled Diagram"),
  description: String (required),
  
  sections: [{
    id: String,
    name: String,
    blocks: [String],
    details: String,
    blockSpecs: {
      blockName: String // technical specifications
    }
  }],
  
  blocks: [{
    id: String,
    sectionId: String,
    name: String,
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    type: String (default: "block")
  }],
  
  connections: [{
    id: String,
    from: String,
    to: String,
    label: String,
    fromBlock: String,
    toBlock: String
  }],
  
  annotations: [{
    id: String,
    x: Number,
    y: Number,
    text: String,
    blockId: String
  }],
  
  metadata: {
    originalDescription: String,
    generatedAt: String,
    generatedBy: String ("gemini-api" or "pattern-matching"),
    solution: String
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### Sample Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "description": "Smart doorbell with camera",
  "sections": [
    {
      "id": "power",
      "name": "Power Supply",
      "blocks": ["AC Adapter", "5V Regulator"],
      "blockSpecs": {
        "AC Adapter": "100-240V input",
        "5V Regulator": "5V 2A output"
      },
      "details": "Provides power to all components"
    }
  ],
  "blocks": [
    {
      "id": "block_0_0",
      "sectionId": "power",
      "name": "AC Adapter",
      "x": 20,
      "y": 100,
      "width": 180,
      "height": 60,
      "type": "block"
    }
  ],
  "connections": [],
  "annotations": [],
  "metadata": {
    "originalDescription": "Smart doorbell with camera",
    "generatedAt": "2024-01-17T10:30:00Z",
    "generatedBy": "gemini-api",
    "solution": "This system integrates..."
  },
  "createdAt": "2024-01-17T10:30:00Z",
  "updatedAt": "2024-01-17T10:30:00Z"
}
```

---

## Architecture & Design

### System Architecture

```
┌─────────────────────────────────────────┐
│          React Frontend (3000)          │
│  - InputSection                         │
│  - DiagramCanvas (Fabric.js)            │
│  - Toolbar, Properties, Solution        │
└────────────┬────────────────────────────┘
             │ HTTP/REST
             │
┌────────────▼────────────────────────────┐
│      Express Backend (5000)             │
│  - API Routes (/api/diagrams/*)         │
│  - Diagram Generation Service           │
│  - MongoDB Integration                  │
└────────────┬────────────────────────────┘
             │ Mongoose ODM
             │
┌────────────▼────────────────────────────┐
│         MongoDB Database                │
│  - Diagrams Collection                  │
│  - Persistent Storage                   │
└─────────────────────────────────────────┘
```

### Diagram Generation Flow

```
1. User Input
   "Smart doorbell with camera"
   │
2. Frontend: handleGenerate()
   │
3. API Call
   POST /api/diagrams/generate
   │
4. Backend: diagramGenerator.generateDiagram()
   │
5. Try Gemini AI
   - Parse with Google Gemini API
   - Extract components and specifications
   │
6. If Gemini fails → Pattern Matching Fallback
   - Regex pattern detection
   - Keyword categorization
   - Default block assignment
   │
7. Layout Calculation
   - Position blocks in 5 sections
   - Calculate X,Y coordinates
   │
8. MongoDB Save
   - Store complete diagram
   │
9. Return Response
   - Full diagram JSON
   │
10. Frontend Rendering
    - DiagramCanvas.renderDiagram()
    - Display sections, blocks, connections
```

### Component Organization

```
App
├── InputSection
│   └── Sends description to backend
├── DiagramCanvas
│   ├── Renders diagram
│   ├── Handles block dragging
│   └── Exports diagram
├── Toolbar
│   └── Action buttons
├── PropertiesPanel
│   └── Edit selected block
└── SolutionPanel
    └── Display AI explanation
```

### Data Flow

```
User Input → Backend API → Gemini AI/Pattern Match → 
Database → JSON Response → React State → 
Fabric.js Canvas Render → Interactive Diagram
```

---

## AI Integration (Gemini)

### Gemini Prompt Strategy

The application sends a structured prompt to Google Gemini:

```
You are an electronics engineer. Analyze this product and generate 
a block diagram in JSON format.

Product: "Smart doorbell with camera and motion sensor"

Return ONLY a JSON object (no markdown, no extra text) with 5 sections:
{
  "sections": [
    {
      "id": "power",
      "name": "Power Supply",
      "blocks": ["AC Adapter"],
      "blockSpecs": {"AC Adapter": "12V 2A"},
      "details": "Powers the system"
    },
    // ... other sections
  ],
  "solution": "How components work together..."
}
```

### Fallback System

If Gemini API fails:
1. Uses pattern matching against component keywords
2. Categorizes components by regex patterns
3. Assigns to appropriate sections
4. Returns diagram with fallback data

**Pattern Categories:**
- Power Supply: battery, charger, adapter, regulator
- Inputs: sensor, camera, microphone, button
- Control: MCU, processor, Arduino, ESP32
- Outputs: LED, display, motor, buzzer
- Peripherals: WiFi, Bluetooth, USB, memory

---

## Deployment

### Production Build

```bash
# Build frontend
cd client
npm run build
# Creates optimized production bundle

# Start production server
cd ..
NODE_ENV=production npm start
```

### Server runs on port 5000, serves:
- API endpoints at `/api/diagrams/*`
- React app at `/` (from `client/build/`)

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/vinora
GEMINI_API_KEY=your_production_key
PORT=5000
```

### Deployment Platforms

**Heroku:**
```bash
heroku create vinora-app
git push heroku main
heroku config:set MONGODB_URI=...
heroku config:set GEMINI_API_KEY=...
```

**AWS / Azure / GCP:**
- Deploy Node.js backend to VM/Container
- MongoDB Atlas for database
- Deploy React build as static assets

---

## Troubleshooting

### MongoDB Connection Error

**Error:** `connect ECONNREFUSED 127.0.0.1:27017`

**Solutions:**
1. Check MongoDB running: `mongosh` or `mongo`
2. For Atlas: Add IP whitelist to cluster
3. Verify `MONGODB_URI` in `.env`

### Gemini API Errors

**Error:** `GEMINI_API_KEY not found`

**Solutions:**
1. Verify `.env` file exists
2. Check key format starts with `AIza`
3. Regenerate key from Google AI Studio
4. No extra spaces in key

### Port Already in Use

**Error:** `listen EADDRINUSE :::5000`

**Solutions:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000 && taskkill /PID <PID> /F  # Windows
```

Or change port in `.env`:
```env
PORT=5001
```

### npm Install Issues

**Error:** `ERR! code ERESOLVE`

**Solution:**
```bash
npm install --legacy-peer-deps
```

### Canvas Not Rendering

**Issue:** Diagram displays but no blocks visible

**Solutions:**
1. Check browser console for errors (F12)
2. Verify Fabric.js loaded
3. Check diagram data structure
4. Ensure canvas.renderAll() called

### API Returns 500 Error

**Error:** `Failed to generate diagram`

**Debugging:**
```bash
# Check backend logs
# Look for error messages
# Verify Gemini API key
# Test API directly:
curl -X POST http://localhost:5000/api/diagrams/generate \
  -H "Content-Type: application/json" \
  -d '{"description":"test"}'
```

### CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS`

**Solution:** Already configured in server.js
```javascript
app.use(cors());
```

---

## Development Tips

### Hot Reload

**Frontend:** React auto-refreshes on file changes
**Backend:** Nodemon auto-restarts on file changes

### Testing Endpoints

Use Postman, cURL, or VS Code REST Client:

```http
### Generate Diagram
POST http://localhost:5000/api/diagrams/generate
Content-Type: application/json

{
  "description": "Wireless charger with USB-C"
}

### Get All Diagrams
GET http://localhost:5000/api/diagrams

### Export as JSON
GET http://localhost:5000/api/diagrams/{{diagramId}}/export/json
```

### Database Management

**MongoDB Compass** (GUI):
1. Download from mongodb.com
2. Connect to `mongodb://localhost:27017`
3. Browse collections

**mongosh** (CLI):
```bash
mongosh
use vinora
db.diagrams.find()
db.diagrams.deleteMany({})  # Clear all
```

### Debugging Canvas Issues

In browser DevTools Console:
```javascript
// Access Fabric.js canvas
const objects = canvas.getObjects();
console.log(objects);

// Get selected object
console.log(canvas.getActiveObject());

// Clear canvas
canvas.clear();
```

### Adding New Section Types

1. Modify `diagramGenerator.js` componentPatterns
2. Add new section object
3. Update Gemini prompt
4. Update CSS section styling

### Performance Optimization

1. **Lazy load images** if adding them
2. **Memoize components** with React.memo()
3. **Debounce block dragging** for smoothness
4. **Pagination for diagrams list**
5. **Cache API responses** with React Query

### Git Workflow

```bash
git add .
git commit -m "Add feature description"
git push origin main
```

### Code Quality

Use ESLint (already configured):
```bash
npm run lint
```

---

## Common Use Cases

### Use Case 1: Generate Simple Device

1. User enters: "USB power bank with LED indicators"
2. System generates:
   - Power: Battery, charging circuit
   - Inputs: Charge level sensor
   - Control: Microcontroller
   - Outputs: LED indicators
   - Peripherals: USB port

### Use Case 2: Complex IoT System

1. User enters: "Smart home hub with WiFi, Bluetooth, ZigBee, and cloud connectivity"
2. System generates:
   - Power: AC adapter, battery backup
   - Inputs: Temperature, humidity sensors
   - Control: High-end processor
   - Outputs: Status display
   - Peripherals: WiFi, Bluetooth, ZigBee modules

### Use Case 3: Modify Generated Diagram

1. System generates initial diagram
2. User selects block and updates specs
3. User adds custom annotations
4. User exports as Draw.io for further editing

---

## License & Attribution

- Built with React, Express, MongoDB
- Uses Google Gemini API
- Uses Fabric.js for canvas
- Open source (customize as needed)

---

## Support & Resources

### Documentation
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Fabric.js API](http://fabricjs.com/docs/)
- [Google Gemini API](https://ai.google.dev)

### Useful Tools
- [Postman](https://www.postman.com) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [VS Code REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) - API testing in VS Code

---

**Last Updated:** January 17, 2026
**Version:** 1.0.0
