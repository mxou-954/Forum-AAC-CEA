import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../../UserContext';
import '../style/styles.css';
import { Link } from 'react-router-dom';

export default function Connexion() {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('Aucun fichier sélectionné');
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [file, setFile] = useState(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileName(file ? file.name : 'Aucun fichier sélectionné');
  };

  const handleSubmit = () => {
    const file = fileInputRef.current.files[0];
    if (!file) {
      alert('Veuillez sélectionner un fichier');
      return;
    }
  
    const formData = new FormData();
    formData.append('title', title);
  formData.append('description', description);
    formData.append('image', file);
  
    fetch('http://localhost:3000/api/photo', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      fetchImages(); // Fonction pour récupérer les images après l'upload
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };
  
  const fetchImages = () => {
    fetch('http://localhost:3000/api/image', { credentials: 'include' }) // Ajout de credentials: 'include'
    .then(response => response.json())
      .then(data => {
        // Construire les URLs des images à partir des fileId
        const imageUrls = data.images.map(img => `http://localhost:3000/api/image/${img.fileId}`);
        setImages(imageUrls); // Stocker les URLs dans l'état
      })
      .catch(error => console.error('Error fetching images:', error));
  };
  
  useEffect(() => {
    fetchImages(); // Appeler fetchImages au montage du composant pour charger toutes les images disponibles
  }, []);

  const handleDelete = async (fileId) => {
    // Demander une confirmation avant de procéder
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette image ?");
    
    if (!isConfirmed) {
      return; // Si l'utilisateur annule, ne rien faire
    }
  
    try {
      const response = await fetch(`http://localhost:3000/api/image/${fileId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      // Logique pour gérer la suppression côté client, comme rafraîchir la liste d'images ou retirer l'image supprimée du DOM
      console.log('Image supprimée avec succès');
      // Ici, vous pouvez ajouter la logique pour rafraîchir la liste des images ou informer l'utilisateur de la suppression réussie
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
    }
  };

  const handleDownload = async (fileId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/image/download/${fileId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'image'; // Vous pouvez spécifier ici le nom sous lequel vous souhaitez enregistrer l'image
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className='mid_forum'>

    <div className='wrapper_left'>
      <div className='forum_ajouterImage'>
        <h2 className='forum_wrapper_left_h2'>Ajouter Une Photo</h2>
        <div className='forum_div_button'>
         <button className="button_Import" type="button" onClick={handleButtonClick}>
        <span className="button__text">Download</span>
        <span className="button__icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" id="bdd05811-e15d-428c-bb53-8661459f9307" data-name="Layer 2" class="svg"><path d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z"></path><path d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z"></path><path d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,1,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z"></path></svg>
        </span>
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div className='name_file'>{fileName}</div>

      <button className="button_Send" onClick={handleSubmit}>
        <svg className="svg-icon" fill="none" height="22" viewBox="0 0 20 20" width="22" xmlns="http://www.w3.org/2000/svg"><g stroke="#fff" stroke-linecap="round" stroke-width="1.5"><path d="m6.66669 6.66667h6.66671"></path><path clip-rule="evenodd" d="m3.33331 5.00001c0-.92047.74619-1.66667 1.66667-1.66667h10.00002c.9205 0 1.6666.7462 1.6666 1.66667v6.66669c0 .9205-.7461 1.6666-1.6666 1.6666h-4.8274c-.1105 0-.21654.044-.29462.122l-2.50004 2.5c-.26249.2625-.71129.0766-.71129-.2945v-1.9108c0-.2301-.18655-.4167-.41667-.4167h-1.25c-.92048 0-1.66667-.7461-1.66667-1.6666z" fill-rule="evenodd"></path><path d="m6.66669 10h2.5"></path></g></svg>
        <span className="lable">Poster</span>
        </button>
        </div>
      </div>
      <form className="form_titre_forum" onSubmit={handleSubmit}>
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

    <div className='wrapper_right'>
        <h2 className='forum_wrapper_right_h2'>Les photos des autres utilisateurs</h2>
        <div className="ligneHorizontale"></div>

        <div className='forum_div_photos'>
        { [...images].reverse().map((imageUrl, index) => {
    const fileId = imageUrl.split('/').pop(); 

    return (
      // Utilisation d'un fragment JSX pour envelopper les éléments adjacents
      <React.Fragment key={index}> 
        <div className="image-container">
        <div className="image-wrapper"> 

          <Link to={`/image/${fileId}`}>
            <img src={imageUrl} alt={`Uploaded image ${index}`} />
          </Link>


        <button className="like-button">
        <span class="IconContainer_like">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-heart-filled" height="1.5em" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z" stroke-width="0" fill="currentColor" />
</svg>
  </span>
  <p class="text_like">Like</p>
        </button>

        <button class="bookmarkBtn">
  <span class="IconContainer">
    <svg viewBox="0 0 384 512" height="1.2em" class="icon">
      <path
        d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z"
      ></path>
    </svg>
  </span>
  <p class="text">Save</p>
</button>

<button class="bookmarkBtn_download" onClick={() => handleDownload(fileId)}>
  <span class="IconContainer_download">
  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-download" height="1.5em" viewBox="0 0 24 24" stroke-width="3" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
  <path d="M7 11l5 5l5 -5" />
  <path d="M12 4l0 12" />
</svg>
  </span>
  <p class="text_download">D/L</p>
</button>

<button className="bookmarkBtn_delete" onClick={() => handleDelete(fileId)}>
  <span class="IconContainer_delete">
  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash-filled" height="1.5em" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M20 6a1 1 0 0 1 .117 1.993l-.117 .007h-.081l-.919 11a3 3 0 0 1 -2.824 2.995l-.176 .005h-8c-1.598 0 -2.904 -1.249 -2.992 -2.75l-.005 -.167l-.923 -11.083h-.08a1 1 0 0 1 -.117 -1.993l.117 -.007h16z" stroke-width="0" fill="currentColor" />
  <path d="M14 2a2 2 0 0 1 2 2a1 1 0 0 1 -1.993 .117l-.007 -.117h-4l-.007 .117a1 1 0 0 1 -1.993 -.117a2 2 0 0 1 1.85 -1.995l.15 -.005h4z" stroke-width="0" fill="currentColor" />
</svg>
  </span>
  <p class="text_delete">Delete</p>
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
}