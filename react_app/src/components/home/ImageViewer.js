import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../style/styles.css';

const ImageViewer = () => {
  let { fileId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const imageUrl = `http://localhost:3000/api/image/${fileId}`;

  useEffect(() => {
    fetch(`http://localhost:3000/api/messages/${fileId}`)
      .then(res => res.json())
      .then(data => {
        console.log("Réponse de l'API:", data); // Ajoutez ceci
        setMessages(data);
      })
      .catch(err => console.error(err));
  }, [fileId]);

  const sendMessage = () => {
    if (!newMessage.trim()) return; // Ne pas envoyer de messages vides
    fetch(`http://localhost:3000/api/messages/${fileId}`, {
      credentials: 'include', // Très important pour inclure les cookies de session
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newMessage }),
    })
    .then(res => {
      if (!res.ok) {
        // Ici, vous lancez une erreur si la réponse n'est pas OK.
        throw new Error('La réponse du serveur n\'est pas OK');
      }
      return res.json(); // Parsez la réponse en JSON uniquement si la réponse est ok.
    })
    .then(message => {
      // Mettez à jour l'état avec le nouveau message ici.
      // Assurez-vous que l'API renvoie le message nouvellement créé dans le format attendu.
      setMessages(prev => [message, ...prev]);
      setNewMessage(''); // Réinitialise le champ de saisie après l'envoi du message
    })
    .catch(err => console.error(err)); // Gérez les erreurs ici, y compris les erreurs lancées précédemment.
  };

  return (
    <div className='mid_forum'>
      <div className='wrapper_left_viewer'>
        <img src={imageUrl} alt="Uploaded Content" style={{ maxWidth: '100%', height: 'auto' }} />
      </div>
      <div className='wrapper_right_viewer'>
        <div className="card">
          <div className="chat-header">Chat</div>
          <div className="chat-window">
          <ul className="message-list">
  {messages.map(msg => (
    <li key={msg._id}>{msg.email}: {msg.text}</li>
  ))}
</ul>
          </div>
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
    </div>
  
    </div>
    </div>
  );
}

export default ImageViewer;