const express = require('express');
const app = express();
app.use('/uploads', express.static('uploads'));
const mongoose = require('mongoose');
const cors = require('cors'); 
const session = require('express-session');
const MongoStore = require('connect-mongo');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const multer = require('multer');
const sendingUpload = multer({ dest: 'uploads/' }); // Configurez selon vos besoins

const Grid = require('gridfs-stream');
let gfs;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });




app.use(cors({
    origin: 'http://localhost:3001', // Spécifiez l'origine de votre application frontend
    credentials: true, // Permet l'envoi de cookies de session avec les requêtes
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

    exposedHeaders: ['X-Photo-Title', 'X-Photo-Description'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Device-Remember-Token', 'Access-Control-Allow-Origin', 'Origin', 'Accept']


}));

app.use(express.json());











const uri = "mongodb://localhost:27017/Forum";

// Amélioration de la gestion de la connexion
mongoose.connect(uri)
.then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => console.error('Échec de la connexion à MongoDB', err));

  const conn = mongoose.connection;

  conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('photos'); // 'photos' est le nom de votre collection GridFS
  });


  app.use(session({
    secret: 'test',
    resave: false,
    saveUninitialized: false, // N'enregistre pas les sessions non modifiées
    cookie: {
      secure: false, // Utilisez `secure: true` seulement si vous êtes en HTTPS
      httpOnly: true,
      maxAge: 86400000 // 24 heures
    },
    store: MongoStore.create({ mongoUrl: uri })
  }));

app.use((req, res, next) => {
  console.log('Session Access:', req.sessionID);
  console.log('Session Data:', req.session);
  next();
});

const connexionSchema = new mongoose.Schema({
  email: String,
  first_name: String,
  last_name: String,
  password: String,
});

const Connexion = mongoose.model('Connexion', connexionSchema);

app.post("/api/inscription", async (req, res) => {
  const { email, first_name, last_name, password } = req.body;
  if (!email || !first_name || !last_name || !password) {
    return res.status(400).send({ erreur: "Un des champs de connexion n'est pas correctement remplis. Veuillez remplir tous les champs !" });
  }

  const connexion = new Connexion({
    email,
    first_name,
    last_name,
    password,
  });

  try {
    const nouvelUtilisateur = await connexion.save();
    res.status(200).send(nouvelUtilisateur);
  } catch (erreur) {
    res.status(400).send({ erreur: "Impossible de sauvegarder votre compte dans notre base de données !" });
  }
});



app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session Data:', req.session);
  next();
});

app.post("/api/connexion", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ erreur: "Un des champs est manquant !" });
    }

    try {
        const utilisateur = await Connexion.findOne({ email: email });

        if (!utilisateur) {
            return res.status(401).send({ erreur: "Email ou mot de passe incorrect !" });
        }

        if (utilisateur.password !== password) {
            return res.status(401).send({ erreur: "Email ou mot de passe incorrect !" });
        }

        // Si l'email et le mot de passe correspondent
        if (utilisateur.email === email && utilisateur.password === password) {
            // Stocker l'ID de l'utilisateur dans la session
            req.session.userId = utilisateur._id; 
            req.session.email = utilisateur.email; // Stockez l'email dans la session

            console.log("Session userID après connexion:", req.session.userId);
            console.log("Session email après connexion:", req.session.email);


            res.send({
                message: "Connexion réussie !",
                estConnecte: true,
                userId: utilisateur._id, // Inclure l'ID ici
                email: utilisateur.email // Envoyez l'email dans la réponse pour confirmation

            });
        } else {
            res.status(401).send({ message: "Échec de la connexion", estConnecte: false });
        }

    } catch (erreur) {
        console.error(erreur);
        res.status(500).send({ erreur: "Erreur du serveur" });
    }
});


function checkAuth(req, res, next) {
  console.log("Session Data in checkAuth:", req.session);  // Afficher les détails de la session
  if (req.session.userId) {
      next();
  } else {
      console.log("Session or userId not found in checkAuth");
      res.status(401).send({ message: "Non authentifié" });
  }
}

app.get('/api/verifier-connexion', (req, res) => {
    console.log("Session userID:", req.session.userId); 
    if (req.session.userId) {
        res.send({ estConnecte: true });
    } else {
        res.send({ estConnecte: false });
    }
});

app.post('/api/deconnexion', (req, res) => {
    req.session.destroy(); 
    res.send({ message: "Déconnexion réussie" });
});






app.get("/api/profil/:id", async (req, res) => {
    try{
        const id = req.params.id;
        const profil_find = await Connexion.findById(id);

        if (!profil_find){
            res.status(400).send({erreur : "Nous ne trouvons pas votre profil dans notre base de donnée..."})
        }

        res.status(200).send(profil_find);
    }catch(erreur){
        res.status(400).send({erreur : "Nous ne trouvons pas votre profil..."})
    }
});









const PhotoInfoSchema = new mongoose.Schema({
  title: String,
  description: String,
  fileId: mongoose.Schema.Types.ObjectId, // Référence à l'ID du fichier dans GridFS
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Ajout du champ utilisateur
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const PhotoInfo = mongoose.model('PhotoInfo', PhotoInfoSchema);

app.post('/api/photo', upload.single('image'), async (req, res) => {
  if (!req.file) {
      return res.status(400).send('No file uploaded');
  }

  console.log("Session userID avant la création de la photo:", req.session.userId);

  const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'photos'
  });

  const uploadStream = bucket.openUploadStream(req.file.originalname);
  const fileId = uploadStream.id; // ID du fichier dans GridFS

  uploadStream.write(req.file.buffer);
  uploadStream.end();

  uploadStream.on('error', () => {
      return res.status(500).send('Erreur lors du téléchargement du fichier');
  });

  uploadStream.on('finish', async () => {
      try {
          const { title, description } = req.body;
          const userId = req.session.userId; // Assumer que l'ID utilisateur est stocké dans la session
          console.log("Tentative de création d'une photo avec userId:", userId);

          await PhotoInfo.create({ title, description, fileId, userId }); // Inclure userId lors de la création
          res.status(201).send({ fileId, message: 'Fichier et informations téléchargés avec succès' });
      } catch (error) {
          console.error("Erreur lors de la création de la photo:", error);
          res.status(500).send('Erreur lors de la sauvegarde des informations');
      }
  });
});

app.get('/api/image/:fileId', async (req, res) => {
  try {
    const photoInfo = await PhotoInfo.findOne({ fileId: new mongoose.Types.ObjectId(req.params.fileId) });

    if (!photoInfo) {
      return res.status(404).send('Informations de la photo non trouvées');
    }

    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'photos'
    });

    const file = await conn.db.collection('photos.files').findOne({ _id: new mongoose.Types.ObjectId(req.params.fileId) });

    if (!file) {
      return res.status(404).send('Fichier non trouvé');
    }

    // Note : Vous ne pouvez pas "pipe" directement l'image ET envoyer du JSON dans la même réponse HTTP.
    // Vous devez soit utiliser deux routes séparées, soit inclure les informations du fichier dans les headers de la réponse de l'image.
    // Pour cet exemple, on va ajouter des headers personnalisés pour le titre et la description.
    res.setHeader('X-Photo-Title', photoInfo.title);
    res.setHeader('X-Photo-Description', photoInfo.description);
    res.setHeader('X-Photo-Likes', photoInfo.likes.toString());
    bucket.openDownloadStream(new mongoose.Types.ObjectId(req.params.fileId)).pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
});

app.get('/api/image', async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'photos'
    });

    console.log("Recherche des fichiers dans GridFS");

    let files = [];
    await bucket.find({}).forEach(doc => files.push(doc));

    if (!files.length) {
      console.log("Aucun fichier trouvé");
      return res.status(404).send('Aucun fichier trouvé');
    }

    console.log("Fichiers trouvés :", files);

    // Récupérer les informations supplémentaires depuis la collection PhotoInfo
    const photoInfos = await PhotoInfo.find({
      'fileId': { $in: files.map(file => file._id) } // Assurez-vous que les types sont compatibles
    }).lean(); // Utiliser lean pour une récupération plus rapide car nous n'avons pas besoin de méthodes de document Mongoose

    // Créer un objet pour un accès rapide
    const likesMap = {};
    photoInfos.forEach(info => {
      likesMap[info.fileId.toString()] = info.likes; // Utiliser toString() pour éviter les problèmes de correspondance de type ObjectId
    });

    // Joindre les likes avec les fichiers
    const response = files.map(file => ({
      fileId: file._id.toString(),
      filename: file.filename,
      likes: likesMap[file._id.toString()] || 0 // Fournir une valeur par défaut de 0 si aucun like n'est trouvé
    }));

    console.log("Réponse envoyée :", response);
    res.json({ images: response });
  } catch (error) {
    console.error("Erreur lors de la récupération des fichiers", error);
    res.status(500).send('Erreur lors de la récupération des fichiers');
  }
});

app.get('/api/image/download/:fileId', async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'photos'
    });

    const file = await conn.db.collection('photos.files').findOne({ _id: new mongoose.Types.ObjectId(req.params.fileId) });

    if (!file) {
      return res.status(404).send('Fichier non trouvé');
    }

    // Définit un type MIME par défaut si file.contentType est undefined
    const contentType = file.contentType || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);

    bucket.openDownloadStream(new mongoose.Types.ObjectId(req.params.fileId)).pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
});

app.delete('/api/image/:fileId', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);

    // Supprimer le fichier de GridFS
    await conn.db.collection('photos.files').deleteOne({ _id: fileId });
    await conn.db.collection('photos.chunks').deleteMany({ files_id: fileId });

    res.send({ message: 'Fichier supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur lors de la suppression du fichier');
  }
});

app.post('/api/photo/like/:fileId', async (req, res) => {
  try {
    const photo = await PhotoInfo.findOneAndUpdate(
      { fileId: new mongoose.Types.ObjectId(req.params.fileId) },
      { $inc: { likes: 1 } }, // Incrémente le compteur de likes
      { new: true } // Retourne le document mis à jour
    );

    if (!photo) {
      return res.status(404).send('Photo non trouvée');
    }

    res.status(200).send({ likes: photo.likes });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'ajout d\'un like");
  }
});



app.get('/test-session', (req, res) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session Data:', req.session);
  res.status(200).json({
    sessionId: req.sessionID,
    sessionData: req.session
  });
});








const chatMessageSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'File'
  },
  email: { // Renommez ce champ en 'email'
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: false, // le rendre optionnel puisque tous les messages n'auront pas de fichier
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;


app.get('/api/messages/:fileId', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ fileId: req.params.fileId }).sort({ createdAt: 1 }); // Modifié ici
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
});

// Route pour poster un message
// Votre configuration existante de multer
app.post('/api/upload/:fileId', sendingUpload.single('file'), async (req, res) => {
  if (!req.session.email) {
    return res.status(401).send({ message: "Utilisateur non identifié." });
  }

  let fileUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : '';

  const message = new ChatMessage({
    fileId: req.params.fileId,
    email: req.session.email,
    text: req.body.text, // extrait du FormData
    ...(req.file && { fileUrl }), // inclut fileUrl uniquement si un fichier est téléchargé
  });

  try {
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
});











const sendMessageSchema = new mongoose.Schema({
  email: String,
  message: String,
});

const Mail = mongoose.model('Mail', sendMessageSchema);

app.post("/api/mail", checkAuth, async (req, res) => {
  try{
    const utilisateur = await Connexion.findById(req.session.userId);
    const { message } = req.body;

    if (!utilisateur || !message){
      res.status(400).send({erreur : "Vous devex vous autentifier et mettre un message pour poster sur le forum"})
    }
  

  const msg = new Mail ({
    email,
    message,
  });

  const nouveau_message = await msg.save();
  res.status(200).send(nouveau_message);

  }catch {
    res.status(400).send({erreur : "Une erreur s'est produite"})
  }
});





































const transporter = nodemailer.createTransport({
    service: 'gmail', // Utilisez votre service de messagerie
    auth: {
      user: 'mcourbeyrette1@gmail.com', // Remplacez par votre adresse e-mail
      pass: 'ymlw aaoa zexv uppi', // Remplacez par votre mot de passe ou token d'application
    },
  });
  
  // Route pour envoyer un e-mail
  app.post('/api/sendEmail', (req, res) => {
    const { prenom, nom, email, objet, message } = req.body;
  
    const mailOptions = {
      from: email, // L'adresse e-mail de l'expéditeur (peut être la vôtre)
      to: 'mcourbeyrette1@gmail.com', // L'adresse e-mail du destinataire
      subject: objet,
      text: `Message de ${prenom} ${nom} (${email}): ${message}`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).send('Erreur lors de l\'envoi de l\'e-mail.');
      } else {
        console.log('Email envoyé: ' + info.response);
        res.status(200).send('E-mail envoyé avec succès.');
      }
    });
  });





app.use((req, res, next) => {
    res.status(404).send({ message: `Route ${req.url} non trouvée.` });
  });
  
  const port = 3000;
  app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
  });