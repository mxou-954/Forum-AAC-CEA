import React, { useState } from "react";
import { useUser } from "../../UserContext";
import "../style/styles.css";
import { Link } from "react-router-dom";

export default function Connexion() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { setUser } = useUser();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    // Construction de l'objet à envoyer
    const userData = {
      email,
      first_name: prenom,
      last_name: nom,
      password,
    };

    try {
      const response = await fetch("https://forum-aac-photo.fr/api/inscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Quelque chose a mal tourné lors de l'inscription.");
      }

      const data = await response.json();
      console.log(data);

      setUser({ name: `${prenom} ${nom}`, accountId: email });

      alert("Inscription réussie !");
    } catch (error) {
      console.error("Erreur lors de l'envoi des données :", error);
      alert("Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="mid">
      <form className="form" onSubmit={handleSubmit}>
        <p className="title-sec">S'inscrire</p>
        <p className="message">
          Inscrivez-vous maintenant pour bénéficier du forum !
        </p>
        <div className="flex">
          <label>
            <input
              className="input-form"
              type="text"
              required
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />
            <span>Prénom</span>
          </label>

          <label>
            <input
              className="input-form"
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
            <span>Nom</span>
          </label>
        </div>

        <label>
          <input
            className="input-form"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span>Email</span>
        </label>

        <label>
          <input
            className="input-form"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span>Password</span>
        </label>
        <label>
          <input
            className="input-form"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span>Confirm password</span>
        </label>
        <button className="submit" type="submit">
          S'inscrire
        </button>
        <p className="signin">
          Deja un compte ? <Link to="/SignIn">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
