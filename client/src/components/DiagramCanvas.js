import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { fabric } from 'fabric';
import './DiagramCanvas.css';

const DiagramCanvas = forwardRef(({ diagram, selectedElement, onSelectElement, onUpdateDiagram }, ref) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const elementsRef = useRef({ blocks: {}, connections: {}, annotations: {} });
  const drawingConnectionRef = useRef(false);
  const fromBlockRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1400,
      height: 900,
      backgroundColor: '#fafafa',
      selection: true,
    });

    fabricCanvasRef.current = canvas;

    canvas.on('selection:created', (e) => {
      if (e.selected && e.selected[0]) {
        const elementData = e.selected[0].elementData || e.selected[0];
        if (elementData.specification) {
          elementData.fullSpecification = elementData.specification;
        }
        onSelectElement(elementData);
      }
    });

    canvas.on('selection:updated', (e) => {
      if (e.selected && e.selected[0]) {
        onSelectElement(e.selected[0].elementData || e.selected[0]);
      }
    });

    canvas.on('object:modified', () => {
      saveCanvasState();
    });

    canvas.on('object:moving', () => {
      canvas.renderAll();
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  const renderDiagram = (diagramData) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.clear();
    elementsRef.current = { blocks: {}, connections: {}, annotations: {} };

    const sectionWidth = 1200 / 5;
    diagramData.sections.forEach((section, index) => {
      const x = index * sectionWidth;
      const sectionLabel = new fabric.Text(section.name, {
        left: x + 10,
        top: 10,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#667eea',
      });
      canvas.add(sectionLabel);
    });

    if (diagramData.blocks) {
      diagramData.blocks.forEach((block) => {
        createBlock(block);
      });
    }

    diagramData.connections.forEach((conn) => {
      createConnection(conn, diagramData);
    });
    }

    diagramData.annotations.forEach((ann) => {
      createAnnotation(ann);
    });
    }

    canvas.renderAll();
    saveCanvasState();
  };

  const createBlock = (blockData) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const blockWidth = blockData.width || 140;
    const blockHeight = blockData.height || 90;

    const rect = new fabric.Rect({
      left: 0,
      top: 0,
      width: blockWidth,
      height: blockHeight,
      fill: '#f8f9fa',
      stroke: '#667eea',
      strokeWidth: 2,
      rx: 4,
      ry: 4,
      selectable: false,
    });

    const nameText = new fabric.Text(blockData.name, {
      left: blockWidth / 2,
      top: blockHeight / 2 - 20,
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      fill: '#333',
      selectable: false,
      maxWidth: blockWidth - 10,
      width: blockWidth - 10,
      breakWords: true,
    });

    let specText = null;
    if (blockData.specification && blockData.specification.length > 0) {
      specText = new fabric.Text(spec, {
        left: blockWidth / 2,
        top: blockHeight / 2 + 10,
        fontSize: 8,
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        fill: '#666',
        selectable: false,
        maxWidth: blockWidth - 8,
        width: blockWidth - 8,
        breakWords: true,
      });
    }

    const objects = specText ? [rect, nameText, specText] : [rect, nameText];

    const group = new fabric.Group(objects, {
      left: blockData.x || 100,
      top: blockData.y || 100,
      selectable: true,
      hasControls: true,
      evented: true,
    });

    group.elementData = blockData;
    group.type = 'block';

    canvas.add(group);
    elementsRef.current.blocks[blockData.id] = group;
  };

  const createConnection = (connData, diagramData) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !diagramData) return;

    const fromSection = diagramData.sections.find(s => s.id === connData.from);
    const toSection = diagramData.sections.find(s => s.id === connData.to);

    if (!fromSection || !toSection) return;

    const sectionWidth = 1200 / 5;
    const fromX = diagramData.sections.findIndex(s => s.id === connData.from) * sectionWidth + sectionWidth / 2;
    const toX = diagramData.sections.findIndex(s => s.id === connData.to) * sectionWidth + sectionWidth / 2;
    
    const line = new fabric.Line([fromX, 50, toX, 50], {
      stroke: '#28a745',
      strokeWidth: 2,
      selectable: true,
      strokeDashArray: [5, 5],
    });

    if (connData.label) {
      const label = new fabric.Text(connData.label, {
        left: (fromX + toX) / 2,
        top: y - 15,
        fontSize: 10,
        fill: '#28a745',
        backgroundColor: 'white',
        originX: 'center',
      });
      canvas.add(label);
    }

    line.elementData = connData;
    line.type = 'connection';

    canvas.add(line);
    elementsRef.current.connections[connData.id] = line;
  };

  const createAnnotation = (annData) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new fabric.Text(annData.text, {
      left: annData.x,
      top: annData.y,
      fontSize: 12,
      fill: '#856404',
      backgroundColor: '#fff3cd',
      padding: 5,
      selectable: true,
    });

    text.elementData = annData;
    text.type = 'annotation';

    canvas.add(text);
    elementsRef.current.annotations[annData.id] = text;
  };

  const saveCanvasState = () => {
    if (!diagram || !onUpdateDiagram) return;

    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const blocks = [];
    const annotations = [];
    const connections = [];

    canvas.getObjects().forEach((obj) => {
      if (obj.elementData) {
        if (obj.type === 'block') {
          blocks.push({
            ...obj.elementData,
            x: obj.left,
            y: obj.top,
          });
        } else if (obj.type === 'annotation') {
          annotations.push({
            ...obj.elementData,
            x: obj.left,
            y: obj.top,
          });
        } else if (obj.type === 'connection') {
          connections.push(obj.elementData);
        }
      }
    });

    onUpdateDiagram({
      blocks,
      annotations,
      connections: connections.length > 0 ? connections : diagram.connections,
    });
  };

  useImperativeHandle(ref, () => ({
    addBlock: () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const blockId = `block_custom_${Date.now()}`;
      const newBlock = {
        id: blockId,
        sectionId: 'custom',
        name: 'New Block',
        x: 100,
        y: 100,
        width: 150,
        height: 60,
        type: 'block',
      };

      createBlock(newBlock);
      saveCanvasState();
    },

    deleteBlock: () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.remove(activeObject);
        if (activeObject.elementData && activeObject.elementData.id) {
          delete elementsRef.current.blocks[activeObject.elementData.id];
        }
        canvas.renderAll();
        saveCanvasState();
      }
    },

    addConnection: () => {
      alert('Click on two blocks to create a connection');
    },
    addAnnotation: () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const text = prompt('Enter annotation text:');
      if (!text) return;

      const annId = `ann_${Date.now()}`;
      const newAnn = {
        id: annId,
        x: 200,
        y: 200,
        text: text,
        blockId: null,
      };

      createAnnotation(newAnn);
      saveCanvasState();
    },

    clearCanvas: () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      if (window.confirm('Are you sure you want to clear the canvas?')) {
        canvas.clear();
        elementsRef.current = { blocks: {}, connections: {}, annotations: {} };
        saveCanvasState();
      }
    },

    updateElement: (updatedElement) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const obj = canvas.getActiveObject();
      if (obj && obj.elementData) {
        Object.assign(obj.elementData, updatedElement);
        if (obj.type === 'block' && updatedElement.name) {
          const text = obj.getObjects().find(o => o.type === 'text');
          if (text) text.set('text', updatedElement.name);
        }
        if (obj.type === 'annotation' && updatedElement.text) {
          obj.set('text', updatedElement.text);
        }
        canvas.renderAll();
        saveCanvasState();
      }
    },

    exportDiagram: (format) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      if (format === 'svg') {
        const svg = canvas.toSVG();
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagram.svg';
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'drawio') {
        if (!diagram) return;
        const blob = new Blob([drawioData], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagram.drawio';
        a.click();
        URL.revokeObjectURL(url);
      }
    },
  }));

  const generateDrawIOXML = (diagramData) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile>
  <d<mxGraphModel>
      <root>
        ${diagramData.blocks.map(block => 
          `<mxCell id="${block.id}" value="${block.name}" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
            <mxGeometry x="${block.x}" y="${block.y}" width="${block.width}" height="${block.height}" as="geometry"/>
          </mxCell>`
        ).join('\n')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
  };

  return (
    <div className="diagram-canvas-wrapper">
      <canvas ref={canvasRef} id="diagramCanvas" />
    </div>
  );
});

DiagramCanvas.displayName = 'DiagramCanvas';

export default DiagramCanvas;
