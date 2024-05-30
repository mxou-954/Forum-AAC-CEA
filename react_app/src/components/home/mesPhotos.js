import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../style/styles.css";

export default function PhotosEnregistrees() {
  const [images, setImages] = useState([]);
  const [estConnecte, setEstConnecte] = useState(false);

  useEffect(() => {
    fetchMyImages();
  }, []);

  useEffect(() => {
    fetch("https://forum-aac-photo.fr/api/verifier-connexion", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.estConnecte) {
          setEstConnecte(true);
        }
        console.log(data);
      })
      .catch((error) =>
        console.error("Erreur lors de la vérification de la connexion :", error)
      );
  }, []);

  const fetchMyImages = async () => {
    try {
      const response = await fetch("https://forum-aac-photo.fr/api/my_pictures", {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        const validImages = await Promise.all(data.photos.map(async (image) => {
          const imageExists = await checkImageExists(image.fileId);
          return imageExists ? image : null;
        }));
        setImages(validImages.filter(image => image !== null));
      } else {
        console.error("Error fetching images:", data.error);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const checkImageExists = async (fileId) => {
    try {
      const response = await fetch(`https://forum-aac-photo.fr/api/image/${fileId}`, {
        method: 'HEAD',
        credentials: 'include',
      });
      return response.ok;
    } catch (error) {
      console.error("Error checking image existence:", error);
      return false;
    }
  };

  if (estConnecte) {
    return (
      <div className="mid_mypictures">
        <div className="div_title">
          <h1 className="title">Les photos que vous avez postées :</h1>
        </div>
        <div className="ligneHorizontale"></div>
        <div className="wrapper_images_enregistrees">
          {[...images].reverse().map((image) => (
            <div key={image._id} className="image_item">
            <div className="image_info">
                <p className="image_title">{image.title}</p>
                <p className="image_description">{image.description}</p>
              </div>
              <Link to={`/image/${image.fileId}`}>
              
                <img
                  src={`https://forum-aac-photo.fr/api/image/${image.fileId}`}
                  alt={image.title}
                  className="image_mmy"
                />
              </Link>
              
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <div className="est_pas_connecte">
        <div className="loader_myphotos"></div>
        <p className="p_pasconnecte">
          Vous devez vous connecter dans l'onglet{" "}
          <Link className="redirection" to={"/SignIn"}>
            "Compte"
          </Link>{" "}
          avant d'accéder à vos photos postées
        </p>
      </div>
    );
  }
}
