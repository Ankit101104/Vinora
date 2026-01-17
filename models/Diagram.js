const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema({
    id: { type: String, required: true },
    sectionId: { type: String, required: true },
    name: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    type: { type: String, default: 'block' }
}, { _id: false });

const ConnectionSchema = new mongoose.Schema({
    id: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    label: { type: String, default: '' },
    fromBlock: { type: String, default: null },
    toBlock: { type: String, default: null }
}, { _id: false });

const AnnotationSchema = new mongoose.Schema({
    id: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    text: { type: String, required: true },
    blockId: { type: String, default: null }
}, { _id: false });

const SectionSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    blocks: { type: [String], default: [] },
    details: { type: String, default: '' }
}, { _id: false });

const DiagramSchema = new mongoose.Schema({
    title: {
        type: String,
        default: 'Untitled Diagram'
    },
    description: {
        type: String,
        required: true
    },
    sections: {
        type: [SectionSchema],
        default: []
    },
    blocks: {
        type: [BlockSchema],
        default: []
    },
    connections: {
        type: [ConnectionSchema],
        default: []
    },
    annotations: {
        type: [AnnotationSchema],
        default: []
    },
    metadata: {
        originalDescription: { type: String, default: '' },
        generatedAt: { type: String, default: '' },
        generatedBy: { type: String, default: '' },
        solution: { type: String, default: '' }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Diagram', DiagramSchema);
