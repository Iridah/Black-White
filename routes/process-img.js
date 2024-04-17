// routes/process-image.js

const router = express.Router();
const jimp = require('jimp/es');
const { v4: uuidv4 } = require('uuid');

router.post('/', async (req, res) => {
  const imageUrl = req.body.imageUrl;

  try {
    const image = await jimp.read(imageUrl);
    const imageName = uuidv4() + '.jpg'; 
    // Nombre único para la imagen
    image.grayscale().write(`public/images/${imageName}`); 
    
    // Guardar la imagen en blanco y negro

    res.redirect(`/images/${imageName}`); 
