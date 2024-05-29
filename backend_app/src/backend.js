const express = require("express");
const app = express();
app.use("/uploads", express.static("uploads"));
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const multer = require("multer");
const sendingUpload = multer({ dest: "uploads/" }); // Configurez selon vos besoins

const Grid = require("gridfs-stream");
let gfs;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(
  cors({
    origin: "http://localhost:3001", // Spécifiez l'origine de votre application frontend
    credentials: true, // Permet l'envoi de cookies de session avec les requêtes
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

    exposedHeaders: ["X-Photo-Title", "X-Photo-Description"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Device-Remember-Token",
      "Access-Control-Allow-Origin",
      "Origin",
      "Accept",
    ],
  })
);

app.use(express.json());

const uri = "mongodb://localhost:27017/Forum";

// Amélioration de la gestion de la connexion
mongoose
  .connect(uri)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((err) => console.error("Échec de la connexion à MongoDB", err));

const conn = mongoose.connection;

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("photos"); // 'photos' est le nom de votre collection GridFS
});

app.use(
  session({
    secret: "test",
    resave: false,
    saveUninitialized: false, // N'enregistre pas les sessions non modifiées
    cookie: {
      secure: false, // Utilisez `secure: true` seulement si vous êtes en HTTPS
      httpOnly: true,
      maxAge: 86400000, // 24 heures
    },
    store: MongoStore.create({ mongoUrl: uri }),
  })
);

app.use((req, res, next) => {
  next();
});

const connexionSchema = new mongoose.Schema({
  email: String,
  first_name: String,
  last_name: String,
  password: String,
});

const Connexion = mongoose.model("Connexion", connexionSchema);

app.post("/api/inscription", async (req, res) => {
  const { email, first_name, last_name, password } = req.body;
  if (!email || !first_name || !last_name || !password) {
    return res.status(400).send({
      erreur:
        "Un des champs de connexion n'est pas correctement remplis. Veuillez remplir tous les champs !",
    });
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
    res.status(400).send({
      erreur:
        "Impossible de sauvegarder votre compte dans notre base de données !",
    });
  }
});

app.use((req, res, next) => {
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
      return res
        .status(401)
        .send({ erreur: "Email ou mot de passe incorrect !" });
    }

    if (utilisateur.password !== password) {
      return res
        .status(401)
        .send({ erreur: "Email ou mot de passe incorrect !" });
    }

    // Si l'email et le mot de passe correspondent
    if (utilisateur.email === email && utilisateur.password === password) {
      // Stocker l'ID de l'utilisateur dans la session
      req.session.userId = utilisateur._id;
      req.session.email = utilisateur.email; // Stockez l'email dans la session


      res.send({
        message: "Connexion réussie !",
        estConnecte: true,
        userId: utilisateur._id, // Inclure l'ID ici
        email: utilisateur.email, // Envoyez l'email dans la réponse pour confirmation
      });
    } else {
      res
        .status(401)
        .send({ message: "Échec de la connexion", estConnecte: false });
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

app.get("/api/verifier-connexion", (req, res) => {
  if (req.session.userId) {
    res.send({ estConnecte: true });
  } else {
    res.send({ estConnecte: false });
  }
});

app.post("/api/deconnexion", (req, res) => {
  req.session.destroy();
  res.send({ message: "Déconnexion réussie" });
});

app.get("/api/profil/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const profil_find = await Connexion.findById(id);

    if (!profil_find) {
      // Si le profil n'est pas trouvé, envoyer une réponse et arrêter l'exécution
      return res.status(400).send({
        erreur:
          "Nous ne trouvons pas votre profil dans notre base de donnée...",
      });
    }

    // Si le profil est trouvé, envoyer la réponse avec le profil
    res.status(200).send(profil_find);
  } catch (erreur) {
    // En cas d'erreur, envoyer une réponse d'erreur
    res.status(400).send({ erreur: "Nous ne trouvons pas votre profil..." });
  }
});

const PhotoInfoSchema = new mongoose.Schema({
  title: String,
  description: String,
  fileId: mongoose.Schema.Types.ObjectId, // Référence à l'ID du fichier dans GridFS
  userWhoPost: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Ajout du champ utilisateur
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const PhotoInfo = mongoose.model("PhotoInfo", PhotoInfoSchema);

app.post("/api/photo", checkAuth, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }


  const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "photos",
  });

  const uploadStream = bucket.openUploadStream(req.file.originalname);
  const fileId = uploadStream.id; // ID du fichier dans GridFS

  uploadStream.write(req.file.buffer);
  uploadStream.end();

  uploadStream.on("error", () => {
    return res.status(500).send("Erreur lors du téléchargement du fichier");
  });

  uploadStream.on("finish", async () => {
    try {
      const { title, description } = req.body;
      const userId = req.session.userId; // Utilisez userId de la session
      const userWhoPost = req.session.userId;

      if (!userId) {
        console.error("Erreur: userId n'est pas défini dans la session.");
        return res.status(400).send("User not authenticated");
      }


      await PhotoInfo.create({
        title,
        description,
        userWhoPost,
        fileId,
        userId,
      }); // Inclure userId lors de la création
      res.status(201).send({
        fileId,
        message: "Fichier et informations téléchargés avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la création de la photo:", error);
      res.status(500).send("Erreur lors de la sauvegarde des informations");
    }
  });
});

app.get("/api/my_pictures", async (req, res) => {
  const current_user = req.session.userId;
  if (!current_user) {
    return res
      .status(401)
      .send({ error: "L'utilisateur n'est pas connecté..." });
  }

  try {
    // Rechercher toutes les photos postées par l'utilisateur connecté
    const photos_user = await PhotoInfo.find({ userId: current_user });

    // Si aucune photo n'est trouvée
    if (!photos_user.length) {
      return res
        .status(404)
        .send({ error: "Aucune photo trouvée pour cet utilisateur" });
    }

    res.status(200).json({ photos: photos_user });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des photos de l'utilisateur",
      error
    );
    res
      .status(500)
      .send({ error: "Erreur lors de la récupération des photos" });
  }
});

app.get("/api/image/:fileId", async (req, res) => {
  try {
    // Recherchez les informations de la photo par fileId
    const photoInfo = await PhotoInfo.findOne({
      fileId: new mongoose.Types.ObjectId(req.params.fileId),
    });

    if (!photoInfo) {
      return res.status(404).send("Informations de la photo non trouvées");
    }

    // Initialisez le GridFSBucket
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: "photos",
    });

    // Recherchez le fichier dans GridFS
    const file = await conn.db
      .collection("photos.files")
      .findOne({ _id: new mongoose.Types.ObjectId(req.params.fileId) });

    if (!file) {
      return res.status(404).send("Fichier non trouvé");
    }

    // Ajoutez des en-têtes pour les métadonnées
    res.setHeader("X-Photo-Title", photoInfo.title);
    res.setHeader("X-Photo-Description", photoInfo.description);
    res.setHeader("X-Photo-Likes", photoInfo.likes.toString());

    // Téléchargez le fichier
    bucket
      .openDownloadStream(new mongoose.Types.ObjectId(req.params.fileId))
      .pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
});

app.get("/api/image", checkAuth, async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: "photos",
    });


    let files = [];
    await bucket.find({}).forEach((doc) => files.push(doc));

    if (!files.length) {
      return res.status(404).send("Aucun fichier trouvé");
    }


    // Récupérer les informations supplémentaires depuis la collection PhotoInfo
    const photoInfos = await PhotoInfo.find({
      fileId: { $in: files.map((file) => file._id) }, // Assurez-vous que les types sont compatibles
    }).lean(); // Utiliser lean pour une récupération plus rapide car nous n'avons pas besoin de méthodes de document Mongoose

    // Créer un objet pour un accès rapide
    const likesMap = {};
    photoInfos.forEach((info) => {
      likesMap[info.fileId.toString()] = info.likes; // Utiliser toString() pour éviter les problèmes de correspondance de type ObjectId
    });

    // Joindre les likes avec les fichiers
    const response = files.map((file) => ({
      fileId: file._id.toString(),
      filename: file.filename,
      likes: likesMap[file._id.toString()] || 0, // Fournir une valeur par défaut de 0 si aucun like n'est trouvé
    }));

    res.json({ images: response });
  } catch (error) {
    console.error("Erreur lors de la récupération des fichiers", error);
    res.status(500).send("Erreur lors de la récupération des fichiers");
  }
});

app.get("/api/image/download/:fileId", async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: "photos",
    });

    const file = await conn.db
      .collection("photos.files")
      .findOne({ _id: new mongoose.Types.ObjectId(req.params.fileId) });

    if (!file) {
      return res.status(404).send("Fichier non trouvé");
    }

    // Définit un type MIME par défaut si file.contentType est undefined
    const contentType = file.contentType || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.filename}"`
    );

    bucket
      .openDownloadStream(new mongoose.Types.ObjectId(req.params.fileId))
      .pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
});

app.delete("/api/image/:fileId", async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);

    // Supprimer le fichier de GridFS
    await conn.db.collection("photos.files").deleteOne({ _id: fileId });
    await conn.db.collection("photos.chunks").deleteMany({ files_id: fileId });

    res.send({ message: "Fichier supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur lors de la suppression du fichier");
  }
});

app.post("/api/photo/like/:fileId", async (req, res) => {
  try {
    const photo = await PhotoInfo.findOneAndUpdate(
      { fileId: new mongoose.Types.ObjectId(req.params.fileId) },
      { $inc: { likes: 1 } }, // Incrémente le compteur de likes
      { new: true } // Retourne le document mis à jour
    );

    if (!photo) {
      return res.status(404).send("Photo non trouvée");
    }

    res.status(200).send({ likes: photo.likes });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'ajout d'un like");
  }
});

app.get("/test-session", (req, res) => {
  res.status(200).json({
    sessionId: req.sessionID,
    sessionData: req.session,
  });
});

const chatMessageSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "File",
  },
  email: {
    // Renommez ce champ en 'email'
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: false, // le rendre optionnel puisque tous les messages n'auront pas de fichier
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

module.exports = ChatMessage;

app.get("/api/messages/:fileId", async (req, res) => {
  try {
    const messages = await ChatMessage.find({ fileId: req.params.fileId }).sort(
      { createdAt: 1 }
    ); // Modifié ici
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
});

// Route pour poster un message
// Votre configuration existante de multer
app.post(
  "/api/upload/:fileId",
  sendingUpload.single("file"),
  async (req, res) => {
    if (!req.session.email) {
      return res.status(401).send({ message: "Utilisateur non identifié." });
    }

    let fileUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : "";

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
      res.status(500).send("Erreur serveur");
    }
  }
);

const sendMessageSchema = new mongoose.Schema({
  email: String,
  message: String,
});

const Mail = mongoose.model("Mail", sendMessageSchema);

app.post("/api/mail", checkAuth, async (req, res) => {
  try {
    const utilisateur = await Connexion.findById(req.session.userId);
    const { message } = req.body;

    if (!utilisateur || !message) {
      res.status(400).send({
        erreur:
          "Vous devex vous autentifier et mettre un message pour poster sur le forum",
      });
    }

    const msg = new Mail({
      email,
      message,
    });

    const nouveau_message = await msg.save();
    res.status(200).send(nouveau_message);
  } catch {
    res.status(400).send({ erreur: "Une erreur s'est produite" });
  }
});

const transporter = nodemailer.createTransport({
  service: "gmail", // Utilisez votre service de messagerie
  auth: {
    user: "mcourbeyrette1@gmail.com", // Remplacez par votre adresse e-mail
    pass: "ymlw aaoa zexv uppi", // Remplacez par votre mot de passe ou token d'application
  },
});

// Route pour envoyer un e-mail
app.post("/api/sendEmail", (req, res) => {
  const { prenom, nom, email, objet, message } = req.body;

  const mailOptions = {
    from: email, // L'adresse e-mail de l'expéditeur (peut être la vôtre)
    to: "mcourbeyrette1@gmail.com", // L'adresse e-mail du destinataire
    subject: objet,
    text: `Message de ${prenom} ${nom} (${email}): ${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send("Erreur lors de l'envoi de l'e-mail.");
    } else {
      console.log("Email envoyé: " + info.response);
      res.status(200).send("E-mail envoyé avec succès.");
    }
  });
});










const DossierEvenementSchema = new mongoose.Schema({
  title: String,
  description: String,
  fileId: mongoose.Schema.Types.ObjectId,
  userWhoPost: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  photosContenu: [
    {
      photoId: mongoose.Schema.Types.ObjectId, // ID du fichier dans GridFS
      title: String,
      description: String,
    }
  ]
});

const DossierEvenement = mongoose.model("DossierEvenement", DossierEvenementSchema);



app.post(
  "/api/dossier-evenement",
  checkAuth,
  upload.array("images"),
  async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded");
    }

    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: "photos",
    });

    const photoUploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(file.originalname);
        const fileId = uploadStream.id;

        uploadStream.write(file.buffer);
        uploadStream.end();

        uploadStream.on("error", (error) => {
          console.error("Erreur lors de l'upload du fichier:", error);
          reject(error);
        });

        uploadStream.on("finish", () => {
          console.log(`Fichier ${file.originalname} uploadé avec succès avec l'ID ${fileId}`);
          resolve({
            photoId: fileId, // Utilisez photoId ici
            title: file.originalname,
            description: "",
          });
        });
      });
    });

    try {
      const uploadedPhotos = await Promise.all(photoUploadPromises);

      console.log("Photos uploadées:", uploadedPhotos);

      const { title, description } = req.body;
      const userId = req.session.userId;
      const userWhoPost = req.session.userId;

      if (!userId) {
        console.error("Erreur: userId n'est pas défini dans la session.");
        return res.status(400).send("User not authenticated");
      }

      await DossierEvenement.create({
        title,
        description,
        userWhoPost,
        userId,
        photosContenu: uploadedPhotos,
      });

      res.status(201).send({
        message: "Dossier d'événement et photos téléchargés avec succès",
      });
    } catch (error) {
      console.error("Erreur lors du téléchargement du dossier d'événement:", error);
      res.status(500).send("Erreur lors du téléchargement du dossier d'événement");
    }
  }
);


app.get("/api/photosEvenements_dossier", async (req, res) => {
  try {
    const dossiers = await DossierEvenement.find({}).lean();

    if (!dossiers.length) {
      return res.status(404).send("Aucun dossier trouvé");
    }

    const response = dossiers.map((dossier) => ({
      title: dossier.title,
      description: dossier.description,
      fileId: dossier._id.toString(),
      photosContenu: dossier.photosContenu // Inclure les photos
    }));

    res.json({ dossiers: response });
  } catch (error) {
    console.error("Erreur lors de la récupération des dossiers", error);
    res.status(500).send("Erreur lors de la récupération des dossiers");
  }
});

app.get("/api/photosEvenements_dossier/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    console.log("ID du dossier reçu:", fileId);

    const dossier = await DossierEvenement.findOne({
      _id: mongoose.Types.ObjectId.createFromHexString(fileId),
    }).lean();

    if (!dossier) {
      console.log("Dossier non trouvé");
      return res.status(404).send("Dossier non trouvé");
    }

    console.log("Dossier trouvé:", dossier);

    res.json({ photos: dossier.photosContenu });
  } catch (error) {
    console.error("Erreur lors de la récupération des dossiers ", error);
    res.status(500).send("Erreur serveur");
  }
});

app.get("/api/photosEvenements_dossier/:fileId/:photoId", async (req, res) => {
  try {
    const { fileId, photoId } = req.params;

    // Recherchez le dossier correspondant
    const dossier = await DossierEvenement.findOne({
      _id: new mongoose.Types.ObjectId(fileId),
    }).lean();

    if (!dossier) {
      console.log("Dossier non trouvé");
      return res.status(404).send("Dossier non trouvé");
    }

    // Recherchez la photo spécifique dans le dossier
    const photo = dossier.photosContenu.find(
      (photo) => photo._id.toString() === photoId
    );

    if (!photo) {
      console.log("Photo non trouvée dans ce dossier");
      return res.status(404).send("Photo non trouvée dans ce dossier");
    }

    console.log(`Photo trouvée avec ID: ${photo.photoId}`);

    // Initialisez le GridFSBucket
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: "photos",
    });

    // Téléchargez le fichier de la photo
    bucket.openDownloadStream(new mongoose.Types.ObjectId(photo.photoId))
      .pipe(res)
      .on("error", (error) => {
        console.error("Erreur lors du téléchargement du fichier:", error);
        res.status(500).send("Erreur lors du téléchargement du fichier");
      })
      .on("finish", () => {
        console.log(`Fichier ${photo.photoId} téléchargé avec succès`);
      });
  } catch (error) {
    console.error("Erreur serveur", error);
    res.status(500).send("Erreur serveur");
  }
});

app.get("/api/image_doss/:fileId/:photoId", async (req, res) => {
  try {
    const { fileId, photoId } = req.params;

    // Recherchez le dossier correspondant
    const dossier = await DossierEvenement.findOne({
      _id: new mongoose.Types.ObjectId(fileId),
    }).lean();

    if (!dossier) {
      console.log("Dossier non trouvé");
      return res.status(404).send("Dossier non trouvé");
    }

    // Recherchez la photo spécifique dans le dossier
    const photo = dossier.photosContenu.find(
      (photo) => photo._id.toString() === photoId
    );

    if (!photo) {
      console.log("Photo non trouvée dans ce dossier");
      return res.status(404).send("Photo non trouvée dans ce dossier");
    }

    console.log(`Photo trouvée avec ID: ${photo.photoId}`);

    // Initialisez le GridFSBucket
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: "photos",
    });

    // Ajoutez des en-têtes pour les métadonnées
    res.setHeader("X-Photo-Title", photo.title);
    res.setHeader("X-Photo-Description", photo.description);

    // Téléchargez le fichier de la photo
    bucket.openDownloadStream(new mongoose.Types.ObjectId(photo.photoId))
      .pipe(res)
      .on("error", (error) => {
        console.error("Erreur lors du téléchargement du fichier:", error);
        res.status(500).send("Erreur lors du téléchargement du fichier");
      })
      .on("finish", () => {
        console.log(`Fichier ${photo.photoId} téléchargé avec succès`);
      });
  } catch (error) {
    console.error("Erreur serveur", error);
    res.status(500).send("Erreur serveur");
  }
});


app.get("/api/photosEvenements_dossier_ids", async (req, res) => {
  try {
    const dossiers = await DossierEvenement.find({}, 'photosContenu').lean();

    const photoIds = dossiers.reduce((acc, dossier) => {
      dossier.photosContenu.forEach(photo => acc.push(photo.photoId.toString()));
      return acc;
    }, []);

    res.json({ photoIds });
  } catch (error) {
    console.error("Erreur lors de la récupération des IDs des photos des dossiers", error);
    res.status(500).send("Erreur lors de la récupération des IDs des photos des dossiers");
  }
});

app.use((req, res, next) => {
  res.status(404).send({ message: `Route ${req.url} non trouvée.` });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
