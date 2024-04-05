const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors'); 
const session = require('express-session');
const MongoStore = require('connect-mongo');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const multer = require('multer');
const Grid = require('gridfs-stream');
let gfs;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });




app.use(cors({
    origin: 'http://localhost:3001', // Spécifiez l'origine de votre application frontend
    credentials: true, // Permet l'envoi de cookies de session avec les requêtes
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


app.use(session({
  secret: 'test',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Utilisez `secure: true` seulement si vous êtes en HTTPS
  store: MongoStore.create({ mongoUrl: uri })
}));

app.use((req, res, next) => {
  console.log("Session Details:", req.session);
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
    if (req.session.userId) {
        next(); 
    } else {
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












app.post('/api/photo', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  // Créez un stream de téléchargement pour GridFS
  const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'photos'
  });

  const uploadStream = bucket.openUploadStream(req.file.originalname);
  const id = uploadStream.id; // ID du fichier dans GridFS, utile pour le récupérer plus tard

  uploadStream.write(req.file.buffer);
  uploadStream.end();

  uploadStream.on('error', () => {
    return res.status(500).send('Erreur lors du téléchargement du fichier');
  });

  uploadStream.on('finish', () => {
    res.status(201).send({ fileId: id, message: 'Fichier téléchargé avec succès' });
  });
});

app.get('/api/image/:fileId', async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'photos'
    });

    const file = await conn.db.collection('photos.files').findOne({ _id: new mongoose.Types.ObjectId(req.params.fileId) });

    if (!file) {
      return res.status(404).send('Fichier non trouvé');
    }

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

    const response = files.map(file => ({
      fileId: file._id.toString(), // Convertir l'ObjectId en string pour l'envoi
      filename: file.filename,
    }));

    console.log("Réponse envoyée :", response);
    res.json({ images: response });
  } catch (error) {
    console.error("Erreur lors de la récupération des fichiers", error);
    res.status(500).send('Erreur lors de la récupération des fichiers');
  }
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;


app.get('/api/messages/:fileId', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ fileId: req.params.fileId }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
});

// Route pour poster un message
app.post('/api/messages/:fileId', async (req, res) => {
    console.log("Tentative de poster un message avec l'email:", req.session.email);

    if (!req.session.email) {
        return res.status(401).send({ message: "Utilisateur non identifié." });
    }
    try {
      const message = new ChatMessage({
          fileId: req.params.fileId,
          text: req.body.text,
          email: req.session.email
      });
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