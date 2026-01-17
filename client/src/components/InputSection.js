import React, { useState } from 'react';
import './InputSection.css';

function InputSection({ onGenerate, isLoading }) {
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description.trim()) {
      onGenerate(description);
      setDescription('');
    }
  };

  const handleExampleClick = (example) => {
    setDescription(example);
  };

  const examples = [
    'Smart doorbell with camera, PIR motion sensor, microphone, and cloud connectivity',
    'Bluetooth speaker with battery, amp, speaker drivers, and wireless module',
    'Solar inverter converting DC from panels to AC for household power',
    'Fitness smartwatch with heart rate sensor, accelerometer, display, and wireless sync'
  ];

  return (
    <div className="input-section">
      <div className="input-card">
        <h2>📝 Describe Your Electronics Product</h2>
        <p className="help-text">
          Enter a natural language description of any electronics product, and we'll automatically 
          generate a detailed block diagram with AI-identified components.
        </p>

        <form onSubmit={handleSubmit} className="input-form">
          <textarea
            className="input-textarea"
            placeholder="Example: A smart doorbell with camera, motion sensor, microphone, and WiFi connectivity..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={4}
          />
          
          <button 
            type="submit" 
            className="generate-btn"
            disabled={isLoading || !description.trim()}
          >
            {isLoading ? '⏳ Generating...' : '🚀 Generate Diagram'}
          </button>
        </form>

        <div className="examples-section">
          <h3>Try these examples:</h3>
          <div className="example-buttons">
            {examples.map((example, idx) => (
              <button
                key={idx}
                className="example-btn"
                onClick={() => handleExampleClick(example)}
                title={example}
              >
                Example {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="features-grid">
          <div className="feature">
            <span className="feature-icon">🤖</span>
            <h4>AI-Powered</h4>
            <p>Uses Google Gemini API to intelligently extract components</p>
          </div>
          <div className="feature">
            <span className="feature-icon">✏️</span>
            <h4>Fully Editable</h4>
            <p>Add, delete, rename blocks and create custom connections</p>
          </div>
          <div className="feature">
            <span className="feature-icon">💾</span>
            <h4>Multiple Exports</h4>
            <p>Export as JSON, SVG, or draw.io compatible XML</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InputSection;
