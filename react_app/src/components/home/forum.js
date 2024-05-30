import React, { useState, useRef, useEffect } from "react";
import { useUser } from "../../UserContext";
import "../style/styles.css";
import { Link } from "react-router-dom";
import imageCompression from 'browser-image-compression';


export default function Connexion() {
  const singleFileInputRef = useRef(null);
  const multipleFileInputRef = useRef(null);
  const [fileName, setFileName] = useState("Aucun fichier sélectionné");
  const [fileNames, setFileNames] = useState([]);
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const [titleDossier, setTitleDossier] = useState("");
  const [descriptionDossier, setDescriptionDossier] = useState("");
  const [filesDossier, setFilesDossier] = useState([]); // Pour stocker plusieurs fichiers de dossier

  const [estConnecte, setEstConnecte] = useState(false);
  const [likes, setLikes] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [buttonTranslate, setButtonTranslate] = useState("0vw"); // Début à 0vw (position initiale)
  const sidebarWidth = isOpen ? "60%" : "0%"; // Sidebar fermée = 0%, ouverte = 30% de la largeur de la vue

  const [dossiers, setDossiers] = useState([]);
  const [dossierPhotoIds, setDossierPhotoIds] = useState([]);


  const handleFileDossChange = (event) => {
    const files = event.target.files;
    const selectedFiles = [];
    const selectedFileNames = [];

    for (let i = 0; i < files.length && i < 20; i++) {
      selectedFiles.push(files[i]);
      selectedFileNames.push(files[i].name);
    }

    setFilesDossier(selectedFiles);
    setFileNames(selectedFileNames); // Mise à jour de fileNames pour les fichiers de dossier
  };

  const handleSingleFileButtonClick = () => {
    singleFileInputRef.current.click();
  };

  const handleMultipleFileButtonClick = () => {
    multipleFileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFile(file);
    setFileName(file ? file.name : "Aucun fichier sélectionné"); // Mise à jour de fileName pour le fichier unique
  };



  const handleSubmit = async () => {
    const userConfirmed = window.confirm(
      "\nAVERTISSEMENT\n\n <──────|   Si vous postez cette photo, vous consentez aux règles du forum de la rubrique 'Règles'. Vous consentez également à ce que les autres utilisateurs puissent télécharger l'image et l'utiliser.   |──────>\n\nÊtes-vous sûr de vouloir poster cette photo ? "
    );
    if (userConfirmed) {
      const file = singleFileInputRef.current.files[0];
      if (!file) {
        alert("Veuillez sélectionner un fichier");
        return;
      }

      console.log("Original file size:", file.size / 1024, "KB");

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        console.log("Compressed file size:", compressedFile.size / 1024, "KB");

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("image", compressedFile);

        const response = await fetch("https://forum-aac-photo.fr/api/photo", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        console.log("Success:", data);
        fetchImages(); // Fonction pour récupérer les images après l'upload
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleSubmitDossier = async () => {
    const userConfirmed = window.confirm(
      "\nAVERTISSEMENT\n\n <──────|   Si vous postez cette photo, vous consentez aux règles du forum de la rubrique 'Règles'. Vous consentez également à ce que les autres utilisateurs puissent télécharger l'image et l'utiliser.   |──────>\n\nÊtes-vous sûr de vouloir poster cette photo ? "
    );
    if (userConfirmed) {
      if (!filesDossier || filesDossier.length === 0) {
        alert("Veuillez sélectionner au moins un fichier");
        return;
      }

      const formData = new FormData();
      formData.append("title", titleDossier);
      formData.append("description", descriptionDossier);

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      try {
        for (let i = 0; i < filesDossier.length; i++) {
          const file = filesDossier[i];
          console.log("Original file size:", file.size / 1024, "KB");

          const compressedFile = await imageCompression(file, options);
          console.log("Compressed file size:", compressedFile.size / 1024, "KB");

          formData.append("images", compressedFile);
        }

        const response = await fetch("https://forum-aac-photo.fr/api/dossier-evenement", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        console.log("Success:", data);
        fetchImages(); // Fonction pour récupérer les images après l'upload
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };


  useEffect(() => {
    // Récupérer les images
    fetch("https://forum-aac-photo.fr/api/image", { credentials: 'include' })
      .then((response) => response.json())
      .then((data) => {
        setImages(data.images.map((image) => `https://forum-aac-photo.fr/api/image/${image.fileId}`));
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des images :", error);
      });

    // Récupérer les dossiers
    fetch("https://forum-aac-photo.fr/api/photosEvenements_dossier", { credentials: 'include' })
      .then((response) => response.json())
      .then((data) => {
        setDossiers(data.dossiers || []);
        const photoIds = data.dossiers.flatMap(dossier => dossier.photosContenu.map(photo => photo.photoId));
        setDossierPhotoIds(photoIds.map(id => id.toString())); // Assurez-vous que les IDs sont des chaînes de caractères
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des dossiers :", error);
      });
  }, []);

 // Filtrer les images pour exclure celles des dossiers
 const filteredImages = images.filter((imageUrl) => {
  const fileId = imageUrl.split("/").pop();
  console.log("Checking fileId:", fileId); // Ajoutez ce log
  console.log("dossierPhotoIds:", dossierPhotoIds); // Ajoutez ce log
  return !dossierPhotoIds.includes(fileId);
});


  const fetchImages = () => {
    fetch("https://forum-aac-photo.fr/api/image", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        // Conserver la manière dont les images sont traitées
        const imageUrls = data.images.map(
          (img) => `https://forum-aac-photo.fr/api/image/${img.fileId}`
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
    fetchDoss();
  }, []);

  const fetchDoss = () => {
    fetch("https://forum-aac-photo.fr/api/photosEvenements_dossier")
      .then(response => response.json())
      .then(data => setDossiers(data.dossiers))
      .catch(error => console.error("Error fetching dossiers:", error));
  };


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

  useEffect(() => {
    fetch("https://forum-aac-photo.fr/api/photosEvenements_dossier", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Données reçues du backend pour le dossier !!!!! :", data);
        if (data.dossiers) {
          setDossiers(data.dossiers);
          const photoIds = data.dossiers.flatMap(dossier => dossier.photosContenu.map(photo => photo.photoId));
          setDossierPhotoIds(photoIds.map(id => id.toString())); // Assurez-vous que les IDs sont des chaînes de caractères
        } else {
          setDossiers([]);
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des dossiers :", error);
        setDossiers([]);
      });
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
      const response = await fetch(`https://forum-aac-photo.fr/api/image/${fileId}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      // Logique pour gérer la suppression côté client
      console.log("Image supprimée avec succès");
      
      // Recharger la page après la suppression
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image:", error);
    }
  };

  const handleLike = (fileId) => {
    fetch(`https://forum-aac-photo.fr/api/photo/like/${fileId}`, {
      method: "POST",
      credentials: "include", // Pour inclure les cookies de session dans la requête
    })
      .then((response) => {
        if (!response.ok) {
          // Si la réponse n'est pas "ok", traiter les différentes erreurs
          return response.json().then((error) => {
            throw new Error(error.message);
          });
        }
        return response.json();
      })
      .then((data) => {
        // Mettre à jour l'état des likes avec le nouveau nombre de likes retourné
        setLikes((prevLikes) => ({ ...prevLikes, [fileId]: data.likes }));
      })
      .catch((error) => {
        // Afficher un message d'erreur approprié
        console.error("Vous avez déja liké cette image :)");
        alert("Vous avez déja liké cette image :)"); // Affiche une alerte avec le message d'erreur
      });
  };


  const handleDeleteDoss = async (dossierId) => {
    const isConfirmed = window.confirm(
      "\nAVERTISSEMENT\n\n <──────|   Êtes-vous sûr de vouloir supprimer ce dossier ? Le serveur est auto-modéré. Si l'image ne vous appartient pas, ne la supprimez pas, sauf si l'image ne respecte pas les règles de la rubrique 'Règles'.   |──────>"
    );

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`https://forum-aac-photo.fr/api/dossier-evenement/${dossierId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        fetchDoss();
      } else {
        const data = await response.json();
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du dossier:", error);
      alert("Erreur lors de la suppression du dossier.");
    }
  };


  const handleDownload = async (fileId) => {
    try {
      const response = await fetch(
        `https://forum-aac-photo.fr/api/image/download/${fileId}`
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

  function toggleSidebar() {
    setIsOpen(!isOpen);
  }

  if (estConnecte) {
    return (
      <div className="mid_forum">
        <div className="wrapper_left">
          <div className="milieu_verti_sidebar">
            <div
              id="sidebar"
              className={`sidebar ${isOpen ? "open" : ""}`}
              style={{ width: sidebarWidth }}
            >
              <h1 className="title_sidebar">Dossiers photos liées a différents évènements</h1>

              <div className="dossiers">
  {dossiers.length > 0 ? (
    dossiers.map((dossier, index) => (
      <div className="relativeDIV" key={index}>
        <Link to={`/image/dossierEvenement/${dossier.fileId}`} className="dossier">
          <div>
            <h3>{dossier.title}</h3>
            <p>{dossier.description}</p>
          </div>
        </Link>
        <button id="toggleButtonDelete" onClick={() => handleDeleteDoss(dossier.fileId)}>Delete</button>
      </div>
    ))
  ) : (
    <p>Aucun dossier trouvé.</p>
  )}
</div>
            </div></div>
            
            <div className="flex_wrap">   
          <button
                onClick={toggleSidebar}
                id="toggleButton"
                style={{
                  transform: `translateX(${buttonTranslate})`,
                  right: isOpen ? "0%" : "0%",
                }}
              >
                {isOpen ? "Revenir au forum" : "Voir les dossiers évènements"}
              </button>

          <div className="forum_ajouterImage">
            <h2 className="forum_wrapper_left_h2">Ajouter Une Photo</h2>
            <div className="forum_div_button">
            <button
        className="button_Import"
        type="button"
        onClick={handleSingleFileButtonClick}
      >
        <span className="button__text">Download</span>
        <span className="button__icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 35 35"
            id="bdd05811-e15d-428c-bb53-8661459f9307"
            data-name="Layer 2"
            className="svg"
          >
            <path d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z"></path>
            <path d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z"></path>
            <path d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,1,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z"></path>
          </svg>
        </span>
      </button>
      <input
        type="file"
        ref={singleFileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div className="name_file">{fileName}</div>



              <form className="form_titre_forum" onSubmit={handleSubmit}>
                <h2 className="forum_wrapper_h2">
                  Ajouter Titre et Description
                </h2>
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
              </form>{" "}
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

          <div className="forum_ajouterDossier">
            <h2 className="forum_wrapper_left_h2">
              Ajouter Un Dossier Evenement
            </h2>
            <div className="forum_div_button">
            <button
        className="button_Import"
        type="button"
        onClick={handleMultipleFileButtonClick}
      >
        <span className="button__text">Download</span>
        <span className="button__icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 35 35"
            id="bdd05811-e15d-428c-bb53-8661459f9307"
            data-name="Layer 2"
            className="svg"
          >
            <path d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z"></path>
            <path d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z"></path>
            <path d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,1,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z"></path>
          </svg>
        </span>
      </button>
      <input
        type="file"
        ref={multipleFileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileDossChange}
        multiple // Permet de sélectionner plusieurs fichiers
        accept="image/*" // Limite les types de fichiers aux images
      />
      <div className="name_file">
        {fileNames.length > 0 && (
          <div>
            {fileNames.map((fileName, index) => (
              <div key={index}>{fileName}</div>
            ))}
          </div>
        )}
              </div>
              <form className="form_titre_forum" onSubmit={handleSubmit}>
                <h2 className="forum_wrapper_h2">
                  Ajouter Titre et Description
                </h2>
                <br />
                <label>
                  <input
                    className="input"
                    type="text"
                    value={titleDossier}
                    onChange={(e) => setTitleDossier(e.target.value)}
                  />
                  <span>Titre</span>
                </label>
                <label>
                  <input
                    className="input"
                    type="text"
                    value={descriptionDossier}
                    onChange={(e) => setDescriptionDossier(e.target.value)}
                  />
                  <span>Description</span>
                </label>
              </form>{" "}
              <button className="button_Send" onClick={handleSubmitDossier}>
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
          </div>
        </div>

        <div className="vertical-line"></div>

        <div className="wrapper_right">
          <div className="div_title">
            <h1 className="title">Les photos de tout les utilisateurs :</h1>
          </div>

          <div className="ligneHorizontale"></div>

          <div className="forum_div_photos">
            {[...filteredImages].reverse().map((imageUrl, index) => {
              const fileId = imageUrl.split("/").pop();

              return (
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
          Vous devez vous connecter dans l'onglet{" "}
          <Link className="redirection" to={"/SignIn"}>
            "Compte"
          </Link>{" "}
          avant d'accéder au forum et ses photos
        </p>
      </div>
    );
  }
}
