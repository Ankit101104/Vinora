import React, { useState, useRef } from 'react';
import './App.css';
import DiagramCanvas from './components/DiagramCanvas';
import Toolbar from './components/Toolbar';
import InputSection from './components/InputSection';
import PropertiesPanel from './components/PropertiesPanel';
import SolutionPanel from './components/SolutionPanel';

function App() {
  const [diagram, setDiagram] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showProperties, setShowProperties] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSolutionPanel, setShowSolutionPanel] = useState(false);
  const canvasRef = useRef(null);

  const handleGenerate = async (description) => {
    setIsGenerating(true);
    setDiagram(null);
    setSelectedElement(null);
    setShowProperties(false);
    
    try {
      const response = await fetch('/api/diagrams/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate diagram');
      }

      const data = await response.json();
      setDiagram(data);
      setShowSolutionPanel(true);
      setSelectedElement(null);
    } catch (error) {
      console.error('Error generating diagram:', error);
      alert(`Failed to generate diagram: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateDiagram = async (updatedDiagram) => {
    if (!diagram?._id) return;
    
    try {
      const response = await fetch(`/api/diagrams/${diagram._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDiagram),
      });

      if (!response.ok) {
        throw new Error('Failed to update diagram');
      }

      const data = await response.json();
      setDiagram(data);
    } catch (error) {
      console.error('Error updating diagram:', error);
      alert('Failed to update diagram. Please try again.');
    }
  };

  const handleExport = async (format) => {
    if (!diagram?._id) {
      alert('No diagram to export');
      return;
    }

    try {
      const url = `/api/diagrams/${diagram._id}/export/${format}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `diagram.${format === 'drawio' ? 'xml' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting diagram:', error);
      alert('Failed to export diagram');
    }
  };

  const handleAddBlock = () => {
    if (!diagram) {
      alert('Generate a diagram first');
      return;
    }
    
    if (canvasRef.current) {
      canvasRef.current.addBlock();
    }
  };

  const handleDeleteBlock = () => {
    if (selectedElement && canvasRef.current) {
      canvasRef.current.deleteBlock();
      setSelectedElement(null);
    }
  };

  const handleAddConnection = () => {
    if (!diagram) {
      alert('Generate a diagram first');
      return;
    }
    if (canvasRef.current) {
      canvasRef.current.addConnection();
    }
  };

  const handleAddAnnotation = () => {
    if (!diagram) {
      alert('Generate a diagram first');
      return;
    }
    if (canvasRef.current) {
      const text = prompt('Enter annotation text:');
      if (text) {
        canvasRef.current.addAnnotation();
      }
    }
  };

  const handleCanvasSelect = (element) => {
    setSelectedElement(element);
    setShowProperties(true);
  };

  const handleUpdateElement = (updatedElement) => {
    if (selectedElement) {
      const updatedDiagram = { ...diagram };
      
      if (updatedElement.type === 'block') {
        const blockIndex = updatedDiagram.blocks.findIndex(b => b.id === updatedElement.id);
        if (blockIndex >= 0) {
          updatedDiagram.blocks[blockIndex] = { ...updatedDiagram.blocks[blockIndex], ...updatedElement };
        }
      } else if (updatedElement.type === 'connection') {
        const connIndex = updatedDiagram.connections.findIndex(c => c.id === updatedElement.id);
        if (connIndex >= 0) {
          updatedDiagram.connections[connIndex] = { ...updatedDiagram.connections[connIndex], ...updatedElement };
        }
      }
      
      setSelectedElement(updatedElement);
      handleUpdateDiagram(updatedDiagram);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>⚡ Interactive Block Diagram Canvas</h1>
        <p>Convert natural language descriptions into editable electronics block diagrams</p>
      </header>

      <div className="app-container">
        <div className="input-section-wrapper">
          <InputSection 
            onGenerate={handleGenerate}
            isLoading={isGenerating}
          />
        </div>

        {diagram && (
          <>
            <div className="canvas-section">
              <Toolbar
                onAddBlock={handleAddBlock}
                onDeleteBlock={handleDeleteBlock}
                onAddConnection={handleAddConnection}
                onAddAnnotation={handleAddAnnotation}
                onExport={handleExport}
                selectedElement={selectedElement}
              />
              
              <DiagramCanvas
                ref={canvasRef}
                diagram={diagram}
                selectedElement={selectedElement}
                onSelectElement={handleCanvasSelect}
                onUpdateDiagram={handleUpdateDiagram}
              />
            </div>

            {showProperties && selectedElement && (
              <PropertiesPanel
                element={selectedElement}
                onUpdate={handleUpdateElement}
                onClose={() => setShowProperties(false)}
              />
            )}

            {showSolutionPanel && diagram?.metadata?.solution && (
              <SolutionPanel
                solution={diagram.metadata.solution}
                description={diagram.description}
                onClose={() => setShowSolutionPanel(false)}
              />
            )}
          </>
        )}
      </div>

      <footer className="app-footer">
        <p>© 2024 Electronics Block Diagram Generator | Powered by AI-Driven Component Analysis</p>
      </footer>
    </div>
  );
}

export default App;
