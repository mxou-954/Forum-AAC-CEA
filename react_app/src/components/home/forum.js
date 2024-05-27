import React, { useState, useRef, useEffect } from "react";
import { useUser } from "../../UserContext";
import "../style/styles.css";
import { Link } from "react-router-dom";

export default function Connexion() {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("Aucun fichier sélectionné");
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [estConnecte, setEstConnecte] = useState(false);
  const [likes, setLikes] = useState({});

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileName(file ? file.name : "Aucun fichier sélectionné");
  };

  const handleSubmit = () => {
    const userConfirmed = window.confirm(
      "\nAVERTISSEMENT\n\n <──────|   Si vous postez cette photo, vous consentez aux règles du forum de la rubrique 'Règles'. Vous consentez également à ce que les autres utilisateurs puissent télécharger l'image et l'utiliser.   |──────>\n\nÊtes-vous sûr de vouloir poster cette photo ? "
    );
    if (userConfirmed) {
      const file = fileInputRef.current.files[0];
      if (!file) {
        alert("Veuillez sélectionner un fichier");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("image", file);

      fetch("http://localhost:3000/api/photo", {
        method: "POST",
        body: formData,
        credentials: "include", // Utilisez 'include' pour envoyer les cookies
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          fetchImages(); // Fonction pour récupérer les images après l'upload
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      return;
    }
  };

  const fetchImages = () => {
    fetch("http://localhost:3000/api/image", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        // Conserver la manière dont les images sont traitées
        const imageUrls = data.images.map(
          (img) => `http://localhost:3000/api/image/${img.fileId}`
        );
        setImages(imageUrls); // Stocker les URLs dans l'état

        // Nouveau: Mise à jour de l'état des likes
        const newLikes = {};
        data.images.forEach((img) => {
          newLikes[img.fileId] = img.likes || 0; // S'assurer que chaque image a un like défini, ou 0 par défaut
        });
        setLikes(newLikes); // Mettre à jour l'état des likes
      })
      .catch((error) => console.error("Error fetching images:", error));
  };

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

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (fileId) => {
    // Demander une confirmation avant de procéder
    const isConfirmed = window.confirm(
      "\nAVERTISSEMENT\n\n <──────|   Êtes-vous sûr de vouloir supprimer cette image ? Le serveur est auto-modéré. Si l'image ne vous appartient pas, ne la supprimez pas, sauf si l'image ne respecte pas les règles de la rubrique 'Règles'.   |──────>"
    );

    if (!isConfirmed) {
      return; // Si l'utilisateur annule, ne rien faire
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/image/${fileId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Logique pour gérer la suppression côté client, comme rafraîchir la liste d'images ou retirer l'image supprimée du DOM
      console.log("Image supprimée avec succès");
      // Ici, vous pouvez ajouter la logique pour rafraîchir la liste des images ou informer l'utilisateur de la suppression réussie
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image:", error);
    }
  };

  const handleLike = (fileId) => {
    fetch(`http://localhost:3000/api/photo/like/${fileId}`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        // Mettre à jour l'état des likes avec le nouveau nombre de likes retourné
        setLikes((prevLikes) => ({ ...prevLikes, [fileId]: data.likes }));
      })
      .catch((error) => {
        console.error("Error liking photo:", error);
      });
  };

  const handleDownload = async (fileId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/image/download/${fileId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "image"; // Vous pouvez spécifier ici le nom sous lequel vous souhaitez enregistrer l'image
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleSaveImage = (fileId) => {
    // Récupérer les images sauvegardées depuis le localStorage
    let savedImages = JSON.parse(localStorage.getItem("savedImages")) || [];
    // Ajouter le nouvel ID d'image si pas déjà présent
    if (!savedImages.includes(fileId)) {
      savedImages.push(fileId);
      localStorage.setItem("savedImages", JSON.stringify(savedImages));
    }
  };
  if (estConnecte) {
    return (
      <div className="mid_forum">
        <div className="wrapper_left">
          <div className="forum_ajouterImage">
            <h2 className="forum_wrapper_left_h2">Ajouter Une Photo</h2>
            <div className="forum_div_button">
              <button
                className="button_Import"
                type="button"
                onClick={handleButtonClick}
              >
                <span className="button__text">Download</span>
                <span className="button__icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 35 35"
                    id="bdd05811-e15d-428c-bb53-8661459f9307"
                    data-name="Layer 2"
                    class="svg"
                  >
                    <path d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z"></path>
                    <path d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z"></path>
                    <path d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,1,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z"></path>
                  </svg>
                </span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <div className="name_file">{fileName}</div>

              <button className="button_Send" onClick={handleSubmit}>
                <svg
                  className="svg-icon"
                  fill="none"
                  height="22"
                  viewBox="0 0 20 20"
                  width="22"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g stroke="#fff" stroke-linecap="round" stroke-width="1.5">
                    <path d="m6.66669 6.66667h6.66671"></path>
                    <path
                      clip-rule="evenodd"
                      d="m3.33331 5.00001c0-.92047.74619-1.66667 1.66667-1.66667h10.00002c.9205 0 1.6666.7462 1.6666 1.66667v6.66669c0 .9205-.7461 1.6666-1.6666 1.6666h-4.8274c-.1105 0-.21654.044-.29462.122l-2.50004 2.5c-.26249.2625-.71129.0766-.71129-.2945v-1.9108c0-.2301-.18655-.4167-.41667-.4167h-1.25c-.92048 0-1.66667-.7461-1.66667-1.6666z"
                      fill-rule="evenodd"
                    ></path>
                    <path d="m6.66669 10h2.5"></path>
                  </g>
                </svg>
                <span className="lable">Poster</span>
              </button>
            </div>
          </div>
          <form className="form_titre_forum" onSubmit={handleSubmit}>
            <h2 className="forum_wrapper_h2">Ajouter Titre et Description</h2>
            <br />
            <label>
              <input
                className="input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <span>Titre</span>
            </label>
            <label>
              <input
                className="input"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <span>Description</span>
            </label>
          </form>
        </div>

        <div className="vertical-line"></div>

        <div className="wrapper_right">
          <div className="div_title">
            <h1 className="title">Les photos de tout les utilisateurs :</h1>
          </div>
          <div className="ligneHorizontale"></div>

          <div className="forum_div_photos">
            {[...images].reverse().map((imageUrl, index) => {
              const fileId = imageUrl.split("/").pop();

              return (
                // Utilisation d'un fragment JSX pour envelopper les éléments adjacents
                <React.Fragment key={index}>
                  <div className="image-container">
                    <Link to={`/image/${fileId}`}>
                      <img src={imageUrl} alt={`Uploaded image ${index}`} />
                    </Link>
                    <div className="buttons_actions">
                      <button
                        className="shadow__btn"
                        onClick={() => handleLike(fileId)}
                      >
                        <p className="text_like">Like ({likes[fileId] || 0})</p>
                      </button>

                      <button
                        className="shadow__btn"
                        onClick={() => handleSaveImage(fileId)}
                      >
                        <p className="text">Save</p>
                      </button>

                      <button
                        className="shadow__btn"
                        onClick={() => handleDownload(fileId)}
                      >
                        <p className="text_download">Download</p>
                      </button>

                      <button
                        className="shadow__btn"
                        onClick={() => handleDelete(fileId)}
                      >
                        <p className="text_delete">Delete</p>
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="est_pas_connecte">
      <div class="loader"></div>
        <p className="p_pasconnecte">
          Vous devez vous connecter dans l'onglet <Link className="redirection" to={"/SignIn"}>"Compte"</Link> avant d'accéder au
          forum et ses photos
        </p>
      </div>
    );
  }
}
