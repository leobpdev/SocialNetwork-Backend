const mongoose = require('mongoose')

const publicationSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    minlength: 5
  },
  imageUrl: {
    type: String, // Almacena la URL de la imagen
    required: true, // Hazlo opcional si no todas las publicaciones tendrán imágenes
    validate: {
      validator: function (v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(v); // Valida formatos comunes de imágenes
      },
      message: props => `${props.value} no es una URL válida para una imagen.`,
    },
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
