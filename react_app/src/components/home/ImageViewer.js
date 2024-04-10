import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../style/styles.css';

const ImageViewer = () => {
  let { fileId } = useParams();
  const [imageData, setImageData] = useState({ title: '', description: '', imageUrl: '' });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  useEffect(() => {
    fetch(`http://localhost:3000/api/image/${fileId}`)
      .then(res => {
        // Stockez le titre et la description depuis les headers
        const title = res.headers.get('X-Photo-Title');
        const description = res.headers.get('X-Photo-Description');
        console.log({ title, description }); // Ajoutez ceci pour déboguer

        return res.blob().then(blob => {
          const imageUrl = URL.createObjectURL(blob);
          setImageData({ title, description, imageUrl });
        });
      })
      .catch(err => console.error(err));
  }, [fileId]);

  const sendMessage = async () => {
    if (!newMessage.trim() && !document.getElementById('fileInput').files.length) return;
  
    const formData = new FormData();
    if (document.getElementById('fileInput').files.length) {
      formData.append('file', document.getElementById('fileInput').files[0]);
    }
    formData.append('text', newMessage);
  
    try {
      const response = await fetch(`http://localhost:3000/api/upload/${fileId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const uploadedMessage = await response.json();
      setMessages(prevMessages => [...prevMessages, uploadedMessage]);
      setNewMessage('');
      document.getElementById('fileInput').value = '';
    } catch (error) {
      console.error("Erreur lors de l'envoi du message et/ou du fichier:", error);
    }
  };


  return (
    <div className='mid_forum'>
      <div className='wrapper_left_viewer'>
      {imageData.imageUrl && (
          <>
          <h2>{imageData.title}</h2>
      <p>{imageData.description}</p>
      <img src={imageData.imageUrl} alt="Uploaded Content" style={{ maxWidth: '80%', height: 'auto' }} />
          </>
        )}
      </div>
      <div className='wrapper_right_viewer'>
        <div className="card">
          <div className="chat-header">Chat</div>
          <div className="chat-window">
          <ul className="message-list">
{messages.map(msg => (
  <li key={msg._id} className="message-item">
  <span className={(msg.email || '').includes('courbeyrette') ? 'email-red' : 'email-green'}>
      {msg.email}
    </span>: 
    {msg.text}
    {/* Assurez-vous que cette condition est bien testée et que msg.fileUrl est utilisé */}
    {msg.fileUrl && (
      <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="link-file">Voir le fichier</a>
    )}
  </li>
))}
</ul>   </div>
          <div className="chat-input">
          
            <input 
              type="text" 
              className="message-input" 
              placeholder="Type your message here" 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)} 
            />
            <button className="send-button" onClick={sendMessage}>Send</button>
      </div>
      <input type="file" id="fileInput" />
    </div>
  
    </div>
    </div>
  );
}

export default ImageViewer; 