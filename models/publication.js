const mongoose = require('mongoose')

const publicationSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String, 
    required: false, // Hazlo opcional si no todas las publicaciones tendrán imágenes
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

publicationSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Publication', publicationSchema)
