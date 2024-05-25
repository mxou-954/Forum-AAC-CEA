import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../style/styles.css";

export default function PhotosEnregistrees() {
  const [savedImages, setSavedImages] = useState([]);

  useEffect(() => {
    // Charger les images sauvegardées depuis le localStorage
    const savedImagesIds =
      JSON.parse(localStorage.getItem("savedImages")) || [];
    setSavedImages(savedImagesIds);
  }, []);

  const handleDelete = (fileId) => {
    // Supprimer l'image du localStorage
    const updatedImages = savedImages.filter((id) => id !== fileId);
    localStorage.setItem("savedImages", JSON.stringify(updatedImages));
    setSavedImages(updatedImages); // Mettre à jour l'état
  };

  return (
    <div className="mid_mypictures">
      <div className="div_title">
      <h1 className="title">Les photos que vous avez enregistrées :</h1>
      </div>
      <div className="ligneHorizontale"></div>
      <div className="wrapper_images_enregistrees">
        {savedImages.map((fileId) => (
          <div key={fileId} className="image_item">
            <Link to={`/image/${fileId}`}>
              {" "}
              <img
                src={`http://localhost:3000/api/image/${fileId}`}
                className="image"
                alt="Saved"
              />
            </Link>
            <button onClick={() => handleDelete(fileId)}>
              Supprimer de mes photos
            </button>
            <div className="ligneHorizontaleInside"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
