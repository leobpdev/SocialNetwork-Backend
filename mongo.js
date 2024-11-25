const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.o1opl.mongodb.net/publicationApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url).then(() => {
  const publicationSchema = new mongoose.Schema({
    content: String,
    important: Boolean,
  })

  const Publication = mongoose.model('Publication', publicationSchema)

  /*
  const publication = new Publication({
    content: 'HTML is x',
    important: true,
  })

  publication.save().then(result => {
    console.log('publication saved!')
    mongoose.connection.close()
  })
  */
  Publication.find({}).then(result => {
    result.forEach(publication => {
      console.log(publication)
    })
    mongoose.connection.close()
  })
})

