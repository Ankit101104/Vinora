const { GoogleGenerativeAI } = require('@google/generative-ai');

class DiagramGenerator {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('GEMINI_API_KEY not found. Falling back to pattern matching.');
            this.useGemini = false;
        } else {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            this.useGemini = true;
        }

        this.componentPatterns = {
            powerSupply: [
                'battery', 'power supply', 'ac adapter', 'usb power', 'dc power',
                'voltage regulator', 'charger', 'power source', 'external power',
                'power management', 'pmic', '5v', '12v', '3.3v', 'lipo', 'solar panel',
                'ac power', 'power distribution'
            ],
            inputs: [
                'sensor', 'camera', 'microphone', 'button', 'switch', 'motion sensor',
                'temperature sensor', 'humidity sensor', 'pressure sensor', 'accelerometer',
                'gyroscope', 'gps', 'keypad', 'touch', 'infrared', 'ir receiver',
                'proximity', 'light sensor', 'photodiode', 'encoder', 'rotary encoder',
                'pir sensor', 'distance sensor', 'flow sensor', 'optical sensor'
            ],
            controlProcessing: [
                'microcontroller', 'mcu', 'processor', 'cpu', 'arduino', 'raspberry pi',
                'esp32', 'esp8266', 'stm32', 'arm', 'pic', 'atmega', 'fpga',
                'dsp', 'signal processor', 'ai processor', 'neural network', 'control unit',
                'system-on-chip', 'soc', 'compute module', 'processor module'
            ],
            outputs: [
                'led', 'display', 'lcd', 'oled', 'screen', 'buzzer', 'speaker',
                'motor', 'servo', 'actuator', 'relay', 'valve', 'indicator',
                'vibrator', 'haptic', 'printer', 'driver', 'output device', 'notification'
            ],
            peripherals: [
                'wifi', 'bluetooth', 'ethernet', 'usb', 'uart', 'spi', 'i2c',
                'memory', 'flash', 'sd card', 'eeprom', 'ram', 'storage',
                'rtc', 'real-time clock', 'watchdog', 'oscillator', 'crystal',
                'antenna', 'transceiver', 'modem', 'gsm', 'lte', 'radio', 'wireless',
                'communication module', 'interface', 'connectivity', '4g', '5g'
            ]
        };

        this.defaultBlocks = {
            powerSupply: ['Power Supply'],
            inputs: ['Input Interface'],
            controlProcessing: ['MCU/Processor'],
            outputs: ['Output Interface'],
            peripherals: ['Peripherals']
        };
    }

    async generateDiagram(description) {
        if (this.useGemini) {
            try {
                return await this.generateWithGemini(description);
            } catch (error) {
                console.error('Gemini API error, falling back to pattern matching:', error.message);
                return this.generateWithPatternMatching(description);
            }
        } else {
            return this.generateWithPatternMatching(description);
        }
    }

    async generateWithGemini(description) {
        const prompt = `You are an electronics engineer. Analyze this product and generate a block diagram in JSON format.

Product: "${description}"

Return ONLY a JSON object (no markdown, no extra text) with 5 sections:
{
  "sections": [
    {"id": "power", "name": "Power Supply", "blocks": ["Component1", "Component2"], "blockSpecs": {"Component1": "5V 2A supply", "Component2": "3.3V regulator"}, "details": "Power details..."},
    {"id": "inputs", "name": "Inputs Block", "blocks": ["Component1"], "blockSpecs": {"Component1": "Sensor specs"}, "details": "Input details..."},
    {"id": "control", "name": "Control and Processing Block", "blocks": ["Component1"], "blockSpecs": {"Component1": "Processor specs"}, "details": "Control details..."},
    {"id": "outputs", "name": "Outputs Block", "blocks": ["Component1"], "blockSpecs": {"Component1": "Output specs"}, "details": "Output details..."},
    {"id": "peripherals", "name": "Other Peripherals", "blocks": ["Component1"], "blockSpecs": {"Component1": "Peripheral specs"}, "details": "Peripheral details..."}
  ],
  "solution": "How components work together..."
}

IMPORTANT:
- blockSpecs MUST have specific technical details for THIS product (voltage, current, resolution, frequency, etc.)
- Each block must reference actual components used in THIS product
- Do NOT use generic specifications
- Return ONLY valid JSON, nothing else`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();
            let jsonText = text;
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/```\n?/g, '');
            }
            jsonText = jsonText.trim();
            const lastBrace = jsonText.lastIndexOf('}');
            if (lastBrace !== -1 && lastBrace !== jsonText.length - 1) {
                jsonText = jsonText.substring(0, lastBrace + 1);
            }
            let geminiResult;
            try {
                geminiResult = JSON.parse(jsonText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError.message);
                console.error('Response text:', text.substring(0, 500));
                throw new Error(`Invalid JSON from Gemini: ${parseError.message}`);
            }
            if (!geminiResult.sections || !Array.isArray(geminiResult.sections)) {
                throw new Error('Invalid response structure: missing sections array');
            }
            const diagram = {
                sections: geminiResult.sections.map(section => ({
                    id: section.id,
                    name: section.name,
                    blocks: Array.isArray(section.blocks) && section.blocks.length > 0 
                        ? section.blocks 
                        : this.getDefaultBlocks(section.id),
                    blockSpecs: section.blockSpecs || {},
                    details: section.details || this.getDefaultDetails(section.id)
                })),
                connections: this.generateDefaultConnections(),
                blocks: [],
                annotations: [],
                metadata: {
                    originalDescription: description,
                    generatedAt: new Date().toISOString(),
                    generatedBy: 'gemini-api',
                    solution: geminiResult.solution || 'This electronics product integrates various components across five key functional blocks to create a complete system.'
                }
            };
            const layout = this.calculateLayout(diagram.sections);
            diagram.blocks = layout.blocks;

            return diagram;
        } catch (error) {
            console.error('Error with Gemini API, falling back to pattern matching:', error.message);
            return this.generateWithPatternMatching(description);
        }
    }

    generateWithPatternMatching(description) {
        const components = this.extractComponents(description.toLowerCase());
        const categorized = this.categorizeComponents(components);
        const diagram = {
            sections: [
                {
                    id: 'power',
                    name: 'Power Supply',
                    blocks: categorized.powerSupply.length > 0 
                        ? categorized.powerSupply 
                        : this.defaultBlocks.powerSupply,
                    details: this.getDefaultDetails('power')
                },
                {
                    id: 'inputs',
                    name: 'Inputs Block',
                    blocks: categorized.inputs.length > 0 
                        ? categorized.inputs 
                        : this.defaultBlocks.inputs,
                    details: this.getDefaultDetails('inputs')
                },
                {
                    id: 'control',
                    name: 'Control and Processing Block',
                    blocks: categorized.controlProcessing.length > 0 
                        ? categorized.controlProcessing 
                        : this.defaultBlocks.controlProcessing,
                    details: this.getDefaultDetails('control')
                },
                {
                    id: 'outputs',
                    name: 'Outputs Block',
                    blocks: categorized.outputs.length > 0 
                        ? categorized.outputs 
                        : this.defaultBlocks.outputs,
                    details: this.getDefaultDetails('outputs')
                },
                {
                    id: 'peripherals',
                    name: 'Other Peripherals',
                    blocks: categorized.peripherals.length > 0 
                        ? categorized.peripherals 
                        : this.defaultBlocks.peripherals,
                    details: this.getDefaultDetails('peripherals')
                }
            ],
            connections: this.generateDefaultConnections(),
            blocks: [],
            annotations: [],
            metadata: {
                originalDescription: description,
                generatedAt: new Date().toISOString(),
                generatedBy: 'pattern-matching',
                solution: 'This electronics product integrates various components across five key functional blocks to create a complete system.'
            }
        };

        const layout = this.calculateLayout(diagram.sections);
        diagram.blocks = layout.blocks;

        return diagram;
    }

    getDefaultBlocks(sectionId) {
        const defaults = {
            'power': this.defaultBlocks.powerSupply,
            'inputs': this.defaultBlocks.inputs,
            'control': this.defaultBlocks.controlProcessing,
            'outputs': this.defaultBlocks.outputs,
            'peripherals': this.defaultBlocks.peripherals
        };
        return defaults[sectionId] || ['Block'];
    }

    getDefaultDetails(sectionId) {
        const defaults = {
            'power': 'Power supply provides regulated voltage (typically 5V or 3.3V) to all system components. Power flows from the source through voltage regulators to ensure stable operation. Current requirements depend on the total load of all connected components.',
            'inputs': 'Input block receives signals from sensors and input devices. Signals may be analog (requiring ADC) or digital. Input voltage levels typically match the system logic levels (3.3V or 5V). Data is sampled and transmitted to the control block for processing.',
            'control': 'Control and processing block contains the main microcontroller or processor. It processes input data, executes control algorithms, and manages communication with other blocks. Typical specifications include clock speed, memory capacity, and I/O capabilities.',
            'outputs': 'Output block drives actuators, displays, and indicators based on control signals. Output drivers may be required for high-current devices. Voltage and current specifications depend on the specific output devices used.',
            'peripherals': 'Peripheral block handles communication protocols (UART, SPI, I2C, WiFi, Bluetooth) and storage. Data rates and interface specifications vary based on the communication standard used. Storage capacity depends on application requirements.'
        };
        return defaults[sectionId] || 'This block provides essential functionality for the system.';
    }

    extractComponents(description) {
        const foundComponents = [];
        
        Object.values(this.componentPatterns).flat().forEach(pattern => {
            const regex = new RegExp(`\\b${pattern.replace(/\s+/g, '\\s+')}\\b`, 'i');
            if (regex.test(description)) {
                foundComponents.push(pattern);
            }
        });

        const words = description.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
        if (words) {
            words.forEach(word => {
                if (word.length > 3 && !foundComponents.includes(word.toLowerCase())) {
                    foundComponents.push(word);
                }
            });
        }
        const quoted = description.match(/"([^"]+)"/g);
        if (quoted) {
            quoted.forEach(q => {
                foundComponents.push(q.replace(/"/g, ''));
            });
        }

        return [...new Set(foundComponents)];
    }

    categorizeComponents(components) {
        const categorized = {
            powerSupply: [],
            inputs: [],
            controlProcessing: [],
            outputs: [],
            peripherals: []
        };

        components.forEach(component => {
            const lower = component.toLowerCase();
            let categorizedFlag = false;

            for (const [category, patterns] of Object.entries(this.componentPatterns)) {
                if (patterns.some(pattern => lower.includes(pattern) || pattern.includes(lower))) {
                    categorized[category].push(this.formatComponentName(component));
                    categorizedFlag = true;
                    break;
                }
            }

            if (!categorizedFlag) {
                if (lower.includes('sensor') || lower.includes('input') || lower.includes('detect')) {
                    categorized.inputs.push(this.formatComponentName(component));
                } else if (lower.includes('display') || lower.includes('output') || lower.includes('show')) {
                    categorized.outputs.push(this.formatComponentName(component));
                } else if (lower.includes('process') || lower.includes('control') || lower.includes('mcu')) {
                    categorized.controlProcessing.push(this.formatComponentName(component));
                } else {
                    categorized.peripherals.push(this.formatComponentName(component));
                }
            }
        });

        return categorized;
    }

    formatComponentName(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    generateDefaultConnections() {
        return [
            { id: 'conn1', from: 'power', to: 'control', label: 'Power', fromBlock: null, toBlock: null },
            { id: 'conn2', from: 'inputs', to: 'control', label: 'Data', fromBlock: null, toBlock: null },
            { id: 'conn3', from: 'control', to: 'outputs', label: 'Control', fromBlock: null, toBlock: null },
            { id: 'conn4', from: 'control', to: 'peripherals', label: 'Interface', fromBlock: null, toBlock: null },
            { id: 'conn5', from: 'power', to: 'inputs', label: 'Power', fromBlock: null, toBlock: null },
            { id: 'conn6', from: 'power', to: 'outputs', label: 'Power', fromBlock: null, toBlock: null }
        ];
    }

    calculateLayout(sections) {
        const sectionWidth = 1400 / 5;
        const sectionPadding = 10;
        const canvasHeight = 900;
        const blockHeight = 90;
        const blockSpacing = 12;

        const blocks = [];

        sections.forEach((section, sectionIndex) => {
            const sectionX = sectionIndex * sectionWidth + sectionPadding;
            const maxBlocksInSection = Math.max(...sections.map(s => s.blocks.length));
            const sectionY = canvasHeight / 2 - (maxBlocksInSection * (blockHeight + blockSpacing)) / 2;

            section.blocks.forEach((blockName, blockIndex) => {
                const specification = section.blockSpecs && section.blockSpecs[blockName] 
                    ? section.blockSpecs[blockName]
                    : '';

                blocks.push({
                    id: `block_${section.id}_${blockIndex}`,
                    sectionId: section.id,
                    name: blockName,
                    x: sectionX + 5,
                    y: sectionY + blockIndex * (blockHeight + blockSpacing),
                    width: sectionWidth - sectionPadding * 2 - 5,
                    height: blockHeight,
                    type: 'block',
                    specification: specification
                });
            });
        });

        return { blocks };
    }
}

module.exports = new DiagramGenerator();
