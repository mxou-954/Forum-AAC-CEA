import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../style/styles.css";

export default function PhotosEnregistrees() {
  const [savedImages, setSavedImages] = useState([]);
  const [estConnecte, setEstConnecte] = useState(false);

  useEffect(() => {
    // Charger les images sauvegardées depuis le localStorage
    const savedImagesIds =
      JSON.parse(localStorage.getItem("savedImages")) || [];
    setSavedImages(savedImagesIds);
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

  const handleDelete = (fileId) => {
    // Supprimer l'image du localStorage
    const updatedImages = savedImages.filter((id) => id !== fileId);
    localStorage.setItem("savedImages", JSON.stringify(updatedImages));
    setSavedImages(updatedImages); // Mettre à jour l'état
  };
  if (estConnecte) {
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
                  src={`https://forum-aac-photo.fr/api/image/${fileId}`}
                  className="image_mmy"
                  alt="Saved"
                />
              </Link>
              <div className="button_delete_flex">
                <button
                  className="shaddow__btn"
                  onClick={() => handleDelete(fileId)}
                >
                  Supprimer de mes photos
                </button>
              </div>
              <div className="ligneHorizontaleInside"></div>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <div className="est_pas_connecte">
        <div>
          <svg
            height="108px"
            width="108px"
            viewBox="0 0 128 128"
            class="loaderss"
          >
            <defs>
              <clipPath id="loader-eyes">
                <circle
                  transform="rotate(-40,64,64) translate(0,-56)"
                  r="8"
                  cy="64"
                  cx="64"
                  class="loader__eye1"
                ></circle>
                <circle
                  transform="rotate(40,64,64) translate(0,-56)"
                  r="8"
                  cy="64"
                  cx="64"
                  class="loader__eye2"
                ></circle>
              </clipPath>
              <linearGradient y2="1" x2="0" y1="0" x1="0" id="loader-grad">
                <stop stop-color="#000" offset="0%"></stop>
                <stop stop-color="#fff" offset="100%"></stop>
              </linearGradient>
              <mask id="loader-mask">
                <rect
                  fill="url(#loader-grad)"
                  height="128"
                  width="128"
                  y="0"
                  x="0"
                ></rect>
              </mask>
            </defs>
            <g
              stroke-dasharray="175.93 351.86"
              stroke-width="12"
              stroke-linecap="round"
            >
              <g>
                <rect
                  clip-path="url(#loader-eyes)"
                  height="64"
                  width="128"
                  fill="hsl(193,90%,50%)"
                ></rect>
                <g stroke="hsl(193,90%,50%)" fill="none">
                  <circle
                    transform="rotate(180,64,64)"
                    r="56"
                    cy="64"
                    cx="64"
                    class="loader__mouth1"
                  ></circle>
                  <circle
                    transform="rotate(0,64,64)"
                    r="56"
                    cy="64"
                    cx="64"
                    class="loader__mouth2"
                  ></circle>
                </g>
              </g>
              <g mask="url(#loader-mask)">
                <rect
                  clip-path="url(#loader-eyes)"
                  height="64"
                  width="128"
                  fill="hsl(223,90%,50%)"
                ></rect>
                <g stroke="hsl(223,90%,50%)" fill="none">
                  <circle
                    transform="rotate(180,64,64)"
                    r="56"
                    cy="64"
                    cx="64"
                    class="loader__mouth1"
                  ></circle>
                  <circle
                    transform="rotate(0,64,64)"
                    r="56"
                    cy="64"
                    cx="64"
                    class="loader__mouth2"
                  ></circle>
                </g>
              </g>
            </g>
          </svg>
        </div>
        <p className="p_pasconnecte">
          Vous devez vous connecter dans l'onglet{" "}
          <Link className="redirection" to={"/SignIn"}>
            "Compte"
          </Link>{" "}
          avant d'accéder au photos que vous avez enregistrées
        </p>
      </div>
    );
  }
}
