import React, { useState, useEffect } from 'react'; 
import '../style/styles.css';

export default function Connexion() {
    const [estConnecte, setEstConnecte] = useState(false);


    useEffect(() => {
      fetch('https://forum-aac-photo.fr/api/verifier-connexion', {
      credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
      console.log(data);
  })
  .catch(error => console.error('Erreur lors de la vérification de la connexion :', error));
    }, []);

  return (
    <div className='mid'>
      <p>helloworld</p>
    </div>
  );
}
