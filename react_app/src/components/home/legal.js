import React, { memo } from 'react';

const LegalPage = memo(() => {
  // Style de base pour les sections
  const sectionStyle = {
    maxWidth: '800px', // Limite la largeur de la section pour la lisibilité
    width: '100%', // Utilise la largeur maximale dans le conteneur
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #ccc',
    textAlign: 'left', // Assure que le texte à l'intérieur des sections n'est pas centré
  };

  // Style pour les titres des sections
  const headerStyle = {
    color: 'white',
    paddingBottom: '10px'
  };

  // Style pour le texte
  const textStyle = {
    color: 'white',
    lineHeight: '1.6'
  };

  return (
<div style={{
      padding: "20px", 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", // Ajouté pour le centrage vertical, supprimez si non désiré
      height: "100%", // Assure que le conteneur prend toute la hauteur de la vue
      textAlign: 'center', // Centre le texte dans le conteneur principal
    }}>      <h1 style={{ ...headerStyle, fontSize: '24px', color: 'white' }}>Mentions Légales</h1>
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Identification de l'éditeur du site</h2>
        <p style={textStyle}>Forum-AAC-Photo CEA</p>
        <p style={textStyle}>JARDINS DES MERISIERS, 91191 Gif-sur-Yvette</p>
        <p style={textStyle}>Contact : (Email, Téléphone)</p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headerStyle}>Hébergement du site</h2>
        <p style={textStyle}>Nom de l'hébergeur</p>
        <p style={textStyle}>Adresse</p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headerStyle}>Politique de confidentialité</h2>
        <p style={textStyle}>Cette politique de confidentialité décrit comment nous collectons, utilisons, et partageons vos informations personnelles lorsque vous utilisez notre forum. Nous nous engageons à protéger votre vie privée et à traiter vos données personnelles en toute transparence. Pour toute question concernant cette politique, veuillez nous contacter.</p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headerStyle}>Conditions générales d'utilisation</h2>
        <p style={textStyle}>En accédant et en utilisant notre forum, vous acceptez de vous conformer à nos conditions générales d'utilisation. Cela inclut le respect des autres utilisateurs, l'interdiction de publier du contenu illégal, et l'engagement de ne pas compromettre la sécurité du site. Nous nous réservons le droit de modifier ces conditions à tout moment, donc veuillez les consulter régulièrement.</p>
      </div>

      <div style={sectionStyle}>
        <h2 style={headerStyle}>Droits d'auteur et crédits</h2>
        <p style={textStyle}>Tous les contenus présents sur le site, tels que les textes, graphiques, logos, etc., sont la propriété de l'éditeur du site ou sont utilisés avec permission et sont protégés par les lois sur le droit d'auteur. L'utilisation non autorisée de ces contenus sans permission explicite est strictement interdite.</p>
      </div>
    </div>
  );
});

export default LegalPage;