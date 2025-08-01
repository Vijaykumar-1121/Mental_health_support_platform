const mongoose = require('mongoose');
const ResourceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['article', 'video'],
        required: true
    },
    content: {
        type: String, // For articles
    },
    videoUrl: {
        type: String, // For videos
    },
    date: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('resource', ResourceSchema);