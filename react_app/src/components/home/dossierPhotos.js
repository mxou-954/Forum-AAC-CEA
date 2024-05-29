import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "../style/styles.css";
import { Link } from "react-router-dom";


const DossierPhotos = () => {
  const { fileId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [dossierDetails, setDossierDetails] = useState({});

  useEffect(() => {
    fetch(`http://localhost:3000/api/photosEvenements_dossier/${fileId}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Photos récupérées du serveur:", data);
        if (data.photos) {
          setPhotos(data.photos);
        } else {
          setPhotos([]);
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des photos :", error);
        setPhotos([]);
      });
  }, [fileId]);

  useEffect(() => {
    fetch("http://localhost:3000/api/photosEvenements_dossier", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Données reçues du backend pour le dossier !!!!! :", data);
        if (data.dossiers) {
          setDossiers(data.dossiers);
          // Trouver le dossier spécifique en utilisant fileId
          const selectedDossier = data.dossiers.find(dossier => dossier.fileId === fileId);
          setDossierDetails(selectedDossier || {});
        } else {
          setDossiers([]);
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des dossiers :", error);
        setDossiers([]);
      });
  }, [fileId]);

  return (
    <div className='gene'>
    <div className='titles_dossiers'>
      <h1>{dossierDetails.title}</h1>
      <p>{dossierDetails.description}</p>
    </div>

    <div className="photos-container">
      {photos.length > 0 ? (
        photos.map((photo, index) => (
          <div className="photo-item" key={index}>
          <Link to={`/dossier_event/${fileId}/${photo._id}`}>
            <img
              src={`http://localhost:3000/api/photosEvenements_dossier/${fileId}/${photo._id}`}
              alt={photo.title}
            />
          </Link>

          </div>
        ))
      ) : (
        <p>Aucune photo trouvée pour ce dossier.</p>
      )}
    </div>
    </div>
  );
};

export default DossierPhotos;