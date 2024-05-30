import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../style/styles.css";

const DossierViewer = () => {
  const { fileId, photoId } = useParams();
  const [imageData, setImageData] = useState({
    title: "",
    description: "",
    imageUrl: "",
  });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Charger l'image et les messages
  useEffect(() => {
    // Charge les détails de l'image
    fetch(`http://localhost:3000/api/image_doss/${fileId}/${photoId}`)
      .then((res) => {
        const title = res.headers.get("X-Photo-Title");
        const description = res.headers.get("X-Photo-Description");
        return res.blob().then((blob) => {
          const imageUrl = URL.createObjectURL(blob);
          setImageData({ title, description, imageUrl });
        });
      })
      .catch((err) => console.error(err));

    // Charge les messages liés à l'image
    fetch(`http://localhost:3000/api/messages/${fileId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
      })
      .catch((err) => console.error("Error fetching messages:", err));
  }, [fileId, photoId]);

  const sendMessage = async () => {
    if (
      !newMessage.trim() &&
      !document.getElementById("fileInput").files.length
    )
      return;

    const formData = new FormData();
    if (document.getElementById("fileInput").files.length) {
      formData.append("file", document.getElementById("fileInput").files[0]);
    }
    formData.append("text", newMessage);

    try {
      const response = await fetch(
        `http://localhost:3000/api/upload/${fileId}`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const uploadedMessage = await response.json();
      setMessages((prevMessages) => [...prevMessages, uploadedMessage]);
      setNewMessage("");
      document.getElementById("fileInput").value = "";
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi du message et/ou du fichier:",
        error
      );
    }
  };

  const handleImageClick = () => {
    const imgElement = document.getElementById('fullScreenImage');
    if (imgElement.requestFullscreen) {
      imgElement.requestFullscreen();
    } else if (imgElement.mozRequestFullScreen) { // Firefox
      imgElement.mozRequestFullScreen();
    } else if (imgElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
      imgElement.webkitRequestFullscreen();
    } else if (imgElement.msRequestFullscreen) { // IE/Edge
      imgElement.msRequestFullscreen();
    }
  };

  return (
    <div className="mid_forum">
      <div className="wrapper_left_viewer">
        {imageData.imageUrl && (
          <>
            <img
              id="fullScreenImage"
              src={imageData.imageUrl}
              alt="Uploaded Content"
              style={{ maxWidth: "70%", height: "auto", cursor: "pointer" }}
              onClick={handleImageClick}
            />
          </>
        )}
      </div>
      <div className="wrapper_right_viewer">
        <div className="card">
          <div className="chat-header">Chat</div>
          <div className="chat-window">
            <ul className="message-list">
              {messages.map((msg) => (
                <li key={msg._id} className="message-item">
                  <span
                    className={
                      (msg.email || "").includes("courbeyrette")
                        ? "email-red"
                        : "email-green"
                    }
                  >
                    {msg.email}
                  </span>
                  :{msg.text}
                  {msg.fileUrl && (
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-file"
                    >
                      Voir le fichier
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="chat-input">
            <input
              type="text"
              className="message-input"
              placeholder="Type your message here"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button className="send-button" onClick={sendMessage}>
              Send
            </button>
          </div>
          <input type="file" id="fileInput" />
        </div>
      </div>
    </div>
  );
};

export default DossierViewer;