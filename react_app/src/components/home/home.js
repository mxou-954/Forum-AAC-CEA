import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className='milieu'>
      <h1 className='title_home'>Bienvenue sur le forum !</h1>
      <div className="menu-item" style={{ display: 'inline-block' }}>
      <p className='text_home'>
        Ce forum est dédié à l'amélioration de vos photos. Soumettez vos photos dans la rubrique "Forum" prévue à cet effet et attendez les conseils de nos spécialistes. Inscrivez-vous pour bénéficier du forum, via le bouton ci-dessous ou dans la rubrique : 
        <Link to="/LogIn" style={{ display: 'inline-block', marginLeft: '5px' }}>
          <span className="icon" style={{ display: 'inline-block' }}><i aria-hidden="true" className="ti ti-user"></i></span>
          <span style={{ marginLeft: '10px', fontSize: "1.4rem" }}>mon compte</span>
        </Link>
      </p>
      </div>
      <p className='texte_home'>N'hésitez pas a aller lire la rubrique "Règles" pour comprendre le fonctionnement du site ! </p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/LogIn">
          <button className='submit' onClick={() => alert("Redirection vers l'inscription / connexion")}>Inscription / Connexion</button>
        </Link>
      </div>
    </div>
  );
}