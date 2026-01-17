import React from 'react';
import './SolutionPanel.css';

function SolutionPanel({ solution, description, onClose }) {
  if (!solution && !description) return null;

  return (
    <div className="solution-panel">
      <div className="solution-header">
        <h2>🤖 AI Solution Analysis</h2>
        <button className="close-btn" onClick={onClose} aria-label="Close panel">✕</button>
      </div>

      <div className="solution-content">
        <div className="solution-section">
          <h3>📋 Product Description</h3>
          <p className="description-text">"{description}"</p>
        </div>

        {solution && (
          <div className="solution-section">
            <h3>💡 Technical Analysis</h3>
            <p className="solution-text">{solution}</p>
          </div>
        )}

        <div className="solution-tips">
          <h4>💬 What to do next:</h4>
          <ul>
            <li>✏️ Click on blocks to edit their names and properties</li>
            <li>🔗 Connect blocks by clicking the Connect button in the toolbar</li>
            <li>💬 Add annotations and notes using the Note button</li>
            <li>💾 Export your diagram as JSON, SVG, or Draw.io format</li>
            <li>🗑️ Delete unwanted blocks by selecting them and clicking Delete</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SolutionPanel;
