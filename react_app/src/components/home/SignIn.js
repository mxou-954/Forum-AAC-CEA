import React, { useState, useEffect } from 'react';
import '../style/styles.css';
import { useUser } from '../../UserContext'; // Ajustez le chemin selon la structure de votre projet
import { Link } from 'react-router-dom';


export default function Connexion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [estConnecte, setEstConnecte] = useState(false);
  const { setUser } = useUser(); // Utilisez le hook useUser pour accéder à user et setUser

  useEffect(() => {
    fetch('http://localhost:3000/api/verifier-connexion', {
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
      if (data.estConnecte) {
        setEstConnecte(true); 
      };
      console.log(data);
    })
    .catch(error => console.error('Erreur lors de la vérification de la connexion :', error));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const userData = {
      email,
      password
    };
  
    try {
      const response = await fetch('http://localhost:3000/api/connexion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
  
      // S'assurer de lire le corps de la réponse une seule fois
      const data = await response.json(); 
      if (response.ok) {
        console.log(data); // Assurez-vous que cela loggue les données attendues, incluant l'ID de l'utilisateur
        localStorage.setItem('userId', data.userId); // Exemple, ajustez selon la structure réelle de votre réponse
        setEstConnecte(true);
      } else {
        throw new Error(data.message || 'Quelque chose a mal tourné lors de la connexion.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi des données :', error);
      alert('Erreur lors de la connexion.');
    }
  };

  const handleDeconnexion = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/deconnexion', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        localStorage.removeItem('userId');
        setUser({ name: '', accountId: '' });
        setEstConnecte(false); // Mise à jour de l'état de connexion
      } else {
        throw new Error('Quelque chose a mal tourné lors de la déconnexion.');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

  // Affichage conditionnel basé sur estConnecte
  if (estConnecte) {
    return (
      <div className='mid'>
        <form className="form">
          <p className="title-sec">Vous êtes connecté !</p>
          <p className="message">Vous bénéficiez du forum !</p>
          <button className='deconnexion' onClick={handleDeconnexion}>Déconnexion</button>
        </form>
      </div>
    );
  } else {
    return (
      <div className='mid'>
        <form className="form" onSubmit={handleSubmit}>
          <p className="title-sec">Se connecter</p>
          <p className="message">Connectez-vous pour bénéficier du forum !</p>
          <label>
            <input className="input-form" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            <span>Email</span>
          </label>
          <label>
            <input className="input-form" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            <span>Password</span>
          </label>
          <button className="submit" type="submit">Se Connecter</button>
          <p className="signin">Créer un compte ? <Link to="/LogIn">S'inscrire</Link></p>
        </form>
      </div>
    );
  }
}