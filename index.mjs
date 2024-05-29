import express from 'express';
import jimp from 'jimp';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import webp from 'webp-converter';

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Configuración de multer para guardar archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}-${file.originalname}`);
    }
});
const upload = multer({ storage }); 

app.post('/procesar', upload.single('imagenArchivo'), async (req, res) => {
    try {
        let imagen;

        if (req.body.tipoEntrada === 'url') {
            const urlImagen = req.body.urlImagen;
            imagen = await jimp.read(urlImagen);
        } else if (req.file) {
            (await import('file-type')).fileTypeFromFile(req.file.path)
                .then(async (tipoMime) => { 
                    const tiposAceptados = ['image/webp', 'image/png', 'image/bmp', 'image/jpeg'];

                    if (!tipoMime || !tiposAceptados.includes(tipoMime.mime)) {
                        throw new Error('El archivo no es una imagen válida (solo se aceptan WEBP, PNG, BMP, JPG, JPEG)');
                    }
                    if (req.body.tipoEntrada === 'archivo' && !req.file) {
                        throw new Error('No se ha seleccionado ningún archivo');
                    }
                    console.log('req.file:', req.file);
                    console.log('tipoMime:', tipoMime);

                    if (tipoMime.mime === 'image/webp') {
                        const inputPath = req.file.path;
                        const outputPath = path.join(__dirname, 'uploads', `${uuidv4()}.png`);
                        await webp.dwebp(inputPath, outputPath, "-o"); 
                        imagen = await jimp.read(outputPath);
                        fs.unlinkSync(outputPath);
                    } else {
                        imagen = await jimp.read(req.file.path); 
                    }

                    // Procesamiento de la imagen con Jimp
                    imagen
                        .grayscale()
                        .resize(350, jimp.AUTO)
                        .quality(80);

                    const nombreArchivo = `${uuidv4()}.jpg`;
                    const rutaArchivo = path.join(__dirname, 'imagenes', nombreArchivo);
                    await imagen.writeAsync(rutaArchivo);

                    res.send(`<img src="/imagenes/${nombreArchivo}" alt="Imagen procesada">`);

                    if (req.file) {
                        fs.unlinkSync(req.file.path);
                    }
                })
                .catch(error => {
                    console.error('Error al obtener el tipo MIME:', error);
                    res.status(500).send('Error al procesar la imagen');
                });
        } else {
            throw new Error('No se proporcionó una imagen válida');
        }
    } catch (error) {
        console.error('Error al procesar la imagen:', error);
        res.status(500).send(`Error al procesar la imagen: ${error.message}`);
    }
});





app.listen(port, () => {
    console.log(`Servidor B&W escuchando en http://localhost:${port}`);
});
