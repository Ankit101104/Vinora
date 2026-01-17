import React, { useState, useEffect } from 'react';
import './PropertiesPanel.css';

function PropertiesPanel({ element, onClose, onUpdate }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (element) {
      setFormData({
        id: element.id,
        type: element.type,
        name: element.name || element.text || '',
        label: element.label || '',
        x: element.x || 0,
        y: element.y || 0,
        ...element,
      });
    }
  }, [element]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdate) {
      onUpdate(formData);
    }
    onClose();
  };

  if (!element) return null;

  return (
    <div className="properties-panel">
      <div className="properties-header">
        <h3>Edit {element.type === 'block' ? 'Block' : element.type === 'connection' ? 'Connection' : 'Annotation'}</h3>
        <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
      </div>

      <form onSubmit={handleSubmit} className="properties-form">
        {element.type === 'block' && (
          <>
            <div className="form-group">
              <label htmlFor="blockName">Block Name</label>
              <input
                id="blockName"
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value.slice(0, 20))}
                placeholder="e.g., Battery, MCU, Speaker"
                maxLength="20"
              />
              <small>{formData.name ? formData.name.length : 0}/20 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="sectionId">Section</label>
              <select
                id="sectionId"
                value={formData.sectionId || ''}
                onChange={(e) => handleChange('sectionId', e.target.value)}
              >
                <option value="power">Power Supply</option>
                <option value="inputs">Inputs Block</option>
                <option value="control">Control and Processing</option>
                <option value="outputs">Outputs Block</option>
                <option value="peripherals">Other Peripherals</option>
              </select>
            </div>

            {formData.specification && (
              <div className="form-group">
                <label>Technical Specifications</label>
                <div className="spec-display">
                  {formData.specification}
                </div>
              </div>
            )}
          </>
        )}

        {element.type === 'connection' && (
          <div className="form-group">
            <label htmlFor="connLabel">Connection Label</label>
            <input
              id="connLabel"
              type="text"
              value={formData.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              placeholder="e.g., Power, Data, Control Signal"
            />
          </div>
        )}

        {element.type === 'annotation' && (
          <div className="form-group">
            <label htmlFor="annText">Annotation Text</label>
            <textarea
              id="annText"
              value={formData.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              rows={3}
              placeholder="Enter your note here..."
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="posX">Position X</label>
          <input
            id="posX"
            type="number"
            value={formData.x || 0}
            onChange={(e) => handleChange('x', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="posY">Position Y</label>
          <input
            id="posY"
            type="number"
            value={formData.y || 0}
            onChange={(e) => handleChange('y', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save">
            ✅ Save Changes
          </button>
          <button type="button" className="btn-cancel" onClick={onClose}>
            ❌ Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default PropertiesPanel;
