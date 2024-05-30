import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [objet, setObjet] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    // Créer l'objet avec les données du formulaire
    const formData = {
      prenom,
      nom,
      email,
      objet,
      message,
    };

    
    
    fetch('https://forum-aac-photo.fr/api/sendEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Erreur:', error));
    

    console.log('Données à envoyer:', formData);
    // Réinitialiser les champs du formulaire
    setPrenom('');
    setNom('');
    setEmail('');
    setObjet('');
    setMessage('');
  };

  return (
    <div className='mid'>
      <form className="form" onSubmit={handleSubmit}>
        <p className="title-sec">Contact</p>
        <p className="message">Contactez-nous en cas de soucis sur le site.</p>
        <div className="flex">
          <label>
            <input className="input-form" type="text" required value={prenom} onChange={e => setPrenom(e.target.value)} />
            <span>Prénom</span>
          </label>

          <label>
            <input className="input-form" type="text" required value={nom} onChange={e => setNom(e.target.value)} />
            <span>Nom</span>
          </label>
        </div>

        <label>
          <input className="input-form" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          <span>Email</span>
        </label>

        <label>
          <input className="input-form" type="text" required value={objet} onChange={e => setObjet(e.target.value)} />
          <span>Objet</span>
        </label>
        <label>
          <input className="input-form" type="text" required value={message} onChange={e => setMessage(e.target.value)} />
          <span>Message</span>
        </label>
        <button className="submit" type="submit">Envoyer</button>
      </form>
    </div>
  );
}
