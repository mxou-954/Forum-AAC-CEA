import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import '../style/styles.css';

export default function PhotosEnregistrees() {
  const [savedImages, setSavedImages] = useState([]);

  useEffect(() => {
    // Charger les images sauvegardées depuis le localStorage
    const savedImagesIds = JSON.parse(localStorage.getItem('savedImages')) || [];
    setSavedImages(savedImagesIds);
  }, []);

  return (
    <div className='mid_rules'> 
      <h1 className='title_rules'>Les photos que vous avez enregistrées :</h1>
      <div className="ligneHorizontale"></div>
      <div className='wrapper_images_enregistrees'>
        {savedImages.map(fileId => (
          <Link key={fileId} to={`/image/${fileId}`}> {/* Assurez-vous que la route est configurée correctement */}
            <img src={`http://localhost:3000/api/image/${fileId}`} alt="Saved" />
          </Link>
        ))}
      </div>
    </div>
  );
}