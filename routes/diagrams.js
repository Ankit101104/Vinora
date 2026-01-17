const express = require('express');
const router = express.Router();
const Diagram = require('../models/Diagram');
const diagramGenerator = require('../services/diagramGenerator');

router.post('/generate', async (req, res) => {
    try {
        const { description } = req.body;

        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }

        const diagramData = await diagramGenerator.generateDiagram(description);
        
        const diagram = new Diagram({
            description,
            sections: diagramData.sections || [],
            blocks: diagramData.blocks || [],
            connections: diagramData.connections || [],
            annotations: diagramData.annotations || [],
            metadata: diagramData.metadata || {}
        });

        await diagram.save();

        res.json(diagram);
    } catch (error) {
        console.error('Error generating diagram:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Validation error', 
                details: error.errors 
            });
        }
        res.status(500).json({ error: 'Failed to generate diagram', message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const diagrams = await Diagram.find().sort({ createdAt: -1 });
        res.json(diagrams);
    } catch (error) {
        console.error('Error fetching diagrams:', error);
        res.status(500).json({ error: 'Failed to fetch diagrams' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const diagram = await Diagram.findById(req.params.id);
        if (!diagram) {
            return res.status(404).json({ error: 'Diagram not found' });
        }
        res.json(diagram);
    } catch (error) {
        console.error('Error fetching diagram:', error);
        res.status(500).json({ error: 'Failed to fetch diagram' });
    }
});

router.put('/:id', async (req, res) => {
        const { blocks, connections, annotations, title } = req.body;
        const diagram = await Diagram.findById(req.params.id);
        if (!diagram) {
            return res.status(404).json({ error: 'Diagram not found' });
        }
        if (blocks !== undefined) {
            if (Array.isArray(blocks)) {
                diagram.blocks = blocks.filter(block => 
                    block && typeof block === 'object' && !Array.isArray(block)
                );
            }
        }
        
        if (connections !== undefined) {
            if (Array.isArray(connections)) {
                diagram.connections = connections.filter(conn => 
                    conn && typeof conn === 'object' && !Array.isArray(conn)
                );
            }
        }
        
        if (annotations !== undefined) {
            if (Array.isArray(annotations)) {
                diagram.annotations = annotations.filter(ann => 
                    ann && typeof ann === 'object' && !Array.isArray(ann)
                );
            }
        }
        
        if (title) diagram.title = title;

        await diagram.save();

        res.json(diagram);
    } catch (error) {
        console.error('Error updating diagram:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Validation error', 
                details: error.errors 
            });
        }
        res.status(500).json({ error: 'Failed to update diagram', message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
        const diagram = await Diagram.findByIdAndDelete(req.params.id);
        if (!diagram) {
            return res.status(404).json({ error: 'Diagram not found' });
        }
        res.json({ message: 'Diagram deleted successfully' });
    } catch (error) {
        console.error('Error deleting diagram:', error);
        res.status(500).json({ error: 'Failed to delete diagram' });
    }
});

router.get('/:id/export/json', async (req, res) => {
    try {
        const diagram = await Diagram.findById(req.params.id);
        if (!diagram) {
            return res.status(404).json({ error: 'Diagram not found' });
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=diagram_${diagram._id}.json`);
        res.json(diagram);
    } catch (error) {
        console.error('Error exporting diagram:', error);
        res.status(500).json({ error: 'Failed to export diagram' });
    }
});

router.get('/:id/export/svg', async (req, res) => {
    try {
        const diagram = await Diagram.findById(req.params.id);
        if (!diagram) {
            return res.status(404).json({ error: 'Diagram not found' });
        }

        const svg = generateSVG(diagram);
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Content-Disposition', `attachment; filename=diagram_${diagram._id}.svg`);
        res.send(svg);
    } catch (error) {
        console.error('Error exporting diagram:', error);
        res.status(500).json({ error: 'Failed to export diagram' });
    }
});

router.get('/:id/export/drawio', async (req, res) => {
    try {
        const diagram = await Diagram.findById(req.params.id);
        if (!diagram) {
            return res.status(404).json({ error: 'Diagram not found' });
        }

        const xml = generateDrawIOXML(diagram);
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', `attachment; filename=diagram_${diagram._id}.xml`);
        res.send(xml);
    } catch (error) {
        console.error('Error exporting diagram:', error);
        res.status(500).json({ error: 'Failed to export diagram' });
    }
});

function generateSVG(diagram) {
    const width = 1400;
    const height = 900;
    const blockWidth = 180;
    const blockHeight = 60;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    .section-label { font-size: 14px; font-weight: bold; fill: #333; }
    .block { fill: #e3f2fd; stroke: #1976d2; stroke-width: 2; }
    .block-label { font-size: 12px; fill: #000; text-anchor: middle; }
    .connection { stroke: #666; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
    .connection-label { font-size: 10px; fill: #666; }
    .annotation { fill: #fff3cd; stroke: #ffc107; stroke-width: 1; }
    .annotation-text { font-size: 10px; fill: #333; }
  </style>
  
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <polygon points="0 0, 10 3, 0 6" fill="#666" />
    </marker>
  </defs>`;

    const sectionWidth = width / 5;
    diagram.sections.forEach((section, idx) => {
        const x = idx * sectionWidth;
        const y = 20;
        
        svg += `
  <!-- Section: ${section.name} -->
  <rect x="${x + 10}" y="${y}" width="${sectionWidth - 20}" height="${height - 40}" fill="#f5f5f5" stroke="#ccc" stroke-width="1" stroke-dasharray="5,5"/>
  <text x="${x + sectionWidth / 2}" y="${y + 25}" class="section-label">${section.name}</text>`;
    });

    if (diagram.blocks && Array.isArray(diagram.blocks)) {
        diagram.blocks.forEach((block, idx) => {
            const { x, y, width, height, name } = block;
            svg += `
  <g class="block-group">
    <rect x="${x}" y="${y}" width="${width || blockWidth}" height="${height || blockHeight}" class="block" rx="4"/>
    <text x="${x + (width || blockWidth) / 2}" y="${y + (height || blockHeight) / 2 + 5}" class="block-label">${name || 'Block'}</text>
  </g>`;
        });
    }

    if (diagram.connections && Array.isArray(diagram.connections)) {
        diagram.connections.forEach((conn, idx) => {
            const fromBlock = diagram.blocks?.find(b => b.id === conn.fromBlock);
            const toBlock = diagram.blocks?.find(b => b.id === conn.toBlock);
            
            if (fromBlock && toBlock) {
                const x1 = fromBlock.x + (fromBlock.width || blockWidth) / 2;
                const y1 = fromBlock.y + (fromBlock.height || blockHeight) / 2;
                const x2 = toBlock.x + (toBlock.width || blockWidth) / 2;
                const y2 = toBlock.y + (toBlock.height || blockHeight) / 2;
                
                svg += `
  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="connection"/>
  <text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 5}" class="connection-label">${conn.label || ''}</text>`;
            }
        });
    }

    if (diagram.annotations && Array.isArray(diagram.annotations)) {
        diagram.annotations.forEach((ann, idx) => {
            const { x, y, text } = ann;
            svg += `
  <g class="annotation-group">
    <rect x="${x}" y="${y}" width="120" height="40" class="annotation" rx="3"/>
    <text x="${x + 5}" y="${y + 20}" class="annotation-text">${text || 'Note'}</text>
  </g>`;
        });
    }

    svg += `\n</svg>`;
    return svg;
}

function generateDrawIOXML(diagram) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="Electron" modified="2024-01-17T00:00:00.000Z" agent="Mozilla/5.0" version="15.0.0">
  <diagram id="diagram_${diagram._id}" name="Electronics Block Diagram">
    <mxGraphModel dx="900" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1400" pageHeight="900">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>`;

    let cellId = 2;

    if (diagram.blocks && Array.isArray(diagram.blocks)) {
        diagram.blocks.forEach((block) => {
            const { x, y, width, height, name } = block;
            xml += `
        <mxCell id="${cellId}" value="${name || 'Block'}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e3f2fd;strokeColor=#1976d2;strokeWidth=2" vertex="1" parent="1">
          <mxGeometry x="${x || 0}" y="${y || 0}" width="${width || 180}" height="${height || 60}" as="geometry"/>
        </mxCell>`;
            cellId++;
        });
    }

    if (diagram.connections && Array.isArray(diagram.connections)) {
        const blocks = diagram.blocks || [];
        diagram.connections.forEach((conn) => {
            const fromBlockIdx = blocks.findIndex(b => b.id === conn.fromBlock);
            const toBlockIdx = blocks.findIndex(b => b.id === conn.toBlock);
            
            if (fromBlockIdx >= 0 && toBlockIdx >= 0) {
                const fromCellId = 2 + fromBlockIdx;
                const toCellId = 2 + toBlockIdx;
                
                xml += `
        <mxCell id="${cellId}" value="${conn.label || ''}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1" edge="1" parent="1" source="${fromCellId}" target="${toCellId}">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>`;
                cellId++;
            }
        });
    }

    xml += `
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
    
    return xml;
}

module.exports = router;
