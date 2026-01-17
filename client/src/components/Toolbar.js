import React from 'react';
import './Toolbar.css';

function Toolbar({ onAddBlock, onDeleteBlock, onAddConnection, onAddAnnotation, onExport, selectedElement }) {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <h4>✏️ Edit Tools</h4>
        <button className="toolbar-btn" onClick={onAddBlock} title="Add new block to diagram">
          ➕ Block
        </button>
        <button 
          className="toolbar-btn" 
          onClick={onAddConnection}
          title="Draw connection between blocks"
        >
          🔗 Connect
        </button>
        <button 
          className="toolbar-btn" 
          onClick={onAddAnnotation}
          title="Add annotation or note"
        >
          💬 Note
        </button>
        <button 
          className="toolbar-btn danger" 
          onClick={onDeleteBlock}
          disabled={!selectedElement}
          title="Delete selected element"
        >
          🗑️ Delete
        </button>
      </div>

      <div className="toolbar-group">
        <h4>💾 Export</h4>
        <button className="toolbar-btn" onClick={() => onExport('json')} title="Export as JSON">
          JSON
        </button>
        <button className="toolbar-btn" onClick={() => onExport('svg')} title="Export as SVG image">
          SVG
        </button>
        <button className="toolbar-btn" onClick={() => onExport('drawio')} title="Export as Draw.io XML">
          Draw.io
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
