import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/styles.css';
// Suppose que useUser peut aussi permettre de mettre à jour le contexte, sinon utilisez useState ici
import { useUser } from '../../UserContext';

const Navbar = () => {
  const { user, setUser } = useUser(); // Assumant que setUser peut aussi être utilisé pour mettre à jour le contexte
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    console.log("UserID récupéré du localStorage:", userId);
    
    if (userId) {
      fetch(`http://localhost:3000/api/profil/${userId}`, {
        credentials: 'include'
      })
      .then(response => response.json())
      .then(data => {
        const userName = `${data.first_name}`; 
        const accountId = data.email; 
      
        setUser({ name: userName, accountId: accountId }); 
        setIsFetching(false);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des détails de l'utilisateur:", error);
        setIsFetching(false);
      });
    } else {
      console.log("Aucun userID trouvé dans le localStorage.");
      setIsFetching(false); 
    }
  }, [setUser]);

  console.log("Données utilisateur actuelles dans la Navbar:", user);
  if (isFetching) return <div>Chargement...</div>; 


  return (
  <header className="header">
    <nav className="navbar">
      <div className="group">
        <h3>AAC-CEA-PHOTO</h3>
        <ul className="menu">
          <li className="menu-item">
            <Link to="/forum"><div className="icon"><i aria-hidden="true" className="ti ti-message-2"></i></div><span>Forum</span></Link>
          </li>
          <li className="menu-item">
            <Link to="/règles"><div className="icon"><i aria-hidden="true" className="ti ti-speakerphone"></i></div><span>Règles</span></Link>
          </li>
          <li className="menu-item">
            <Link to="/mesPhotos"><div className="icon"><i aria-hidden="true" className="ti ti-photo-plus"></i></div><span>Mes photos</span></Link>
          </li>
          <li className="menu-item">
            <Link to="/photosEnregistrees"><div className="icon"><i aria-hidden="true" className="ti ti-download"></i></div><span>Enregistrements</span></Link>
          </li>
        </ul>
      </div>
      <div className="group">
        <h3>AUTRES</h3>
        <ul className="menu">
          <li className="menu-item">
            <Link to="/legal"><div className="icon"><i aria-hidden="true" className="ti ti-gavel"></i></div><span>Légal</span></Link>
          </li>
          <li className="menu-item">
            <Link to="/Contact"><div className="icon"><i aria-hidden="true" className="ti ti-address-book"></i></div><span>nous contacter</span></Link>
          </li>
          <li className="menu-item">
            <Link to="/LogIn"><div className="icon"><i aria-hidden="true" className="ti ti-user-check"></i></div><span>Compte</span></Link>
          </li>
          <li className="menu-item">
            <Link to="/Options"><div className="icon"><i aria-hidden="true" className="ti ti-settings"></i></div><span>options</span></Link>
          </li>
        </ul>
      </div>
    </nav>
    <div className="user">
      <div className="avatar"></div>
      <div className="info">
        <h6 className="name">{user.name}</h6>
        <span className="account-id">{user.accountId}</span>
      </div>
    </div>
  </header>
);
};
export default Navbar;





