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
            <Link to="/report"><div className="icon"><i aria-hidden="true" className="ti ti-clipboard-data"></i></div><span>Forum</span></Link>
          </li>
          <li className="menu-item">
            <Link to="/advertisement"><div className="icon"><i aria-hidden="true" className="ti ti-speakerphone"></i></div><span>Règles</span></Link>
          </li>
          <li className="menu-item">
            <Link to="/affiliate"><div className="icon"><i aria-hidden="true" className="ti ti-brand-cashapp"></i></div><span>Mes photos</span></Link>
          </li>
          <li className="menu-item">
            <Link to="/insight"><div className="icon"><i aria-hidden="true" className="ti ti-sparkles"></i></div><span>Photos enregistrées</span></Link>
          </li>
        </ul>
      </div>
      <div className="group">
        <h3>ABOUT ME</h3>
        <ul className="menu">
          <li className="menu-item">
            <Link to="/bank-account"><div className="icon"><i aria-hidden="true" className="ti ti-building-bank"></i></div><span>Légal</span></Link>
          </li>
          <li className="menu-item">
            <Link to="/Contact"><div className="icon"><i aria-hidden="true" className="ti ti-wallet"></i></div><span>nous contacter</span></Link>
          </li>
          <li className="menu-item">
            <Link to="/LogIn"><div className="icon"><i aria-hidden="true" className="ti ti-user"></i></div><span>mon compte</span></Link>
          </li>
          <li className="menu-item">
            <Link to="/settings"><div className="icon"><i aria-hidden="true" className="ti ti-settings-filled"></i></div><span>options</span></Link>
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




