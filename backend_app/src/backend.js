const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors'); 
const session = require('express-session');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

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
    cookie: { secure: false } 
}));


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
            console.log("Session userID après connexion:", req.session.userId);

            // Inclure l'ID de l'utilisateur dans la réponse pour une utilisation ultérieure dans le frontend
            res.send({
                message: "Connexion réussie !",
                estConnecte: true,
                userId: utilisateur._id // Inclure l'ID ici
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

app.get(':Test', checkAuth, (req, res) => {
    res.send("Bienvenue à la zone secrète");
});

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