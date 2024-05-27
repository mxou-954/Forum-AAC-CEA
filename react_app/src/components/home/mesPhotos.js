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
    fetch("http://localhost:3000/api/verifier-connexion", {
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
      const response = await fetch("http://localhost:3000/api/my_pictures", {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setImages(data.photos);
      } else {
        console.error("Error fetching images:", data.error);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
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
              <Link to={`/image/${image.fileId}`}>
                <img
                  src={`http://localhost:3000/api/image/${image.fileId}`}
                  alt={image.title}
                  className="image"
                />
              </Link>
              <div className="ligneHorizontaleInside"></div>

              <div className="image_info">
                <p className="image_title">{image.title}</p>
                <p className="image_description">{image.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <div className="est_pas_connecte">
        <div class="loader_myphotos"></div>
        <p className="p_pasconnecte">
          Vous devez vous connecter dans l'onglet{" "}
          <Link className="redirection" to={"/SignIn"}>
            "Compte"
          </Link>{" "}
          avant d'accéder a vos photos postées
        </p>
      </div>
    );
  }
}
