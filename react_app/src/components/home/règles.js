import React, { useState, useEffect } from 'react'; 
import '../style/styles.css';

export default function Connexion() {
    
  return (
    <div className='mid_rules'> 
    <div className="div_title">
        <h1 className="title">Les règles du forum : </h1>
      </div>
    <div className="ligneHorizontale"></div>
    <div className='wrapper_div_rules'>
    
    <p className='ligneup'>Bienvenue sur notre forum dédié à l'amélioration et à l'échange constructif autour de la photographie.</p>
    <h2>1. Partagez avec Intention</h2>
    <p>Postez vos photos dans l'esprit d'apprendre et de vous améliorer. Chaque publication doit être accompagnée d'une courte description ou d'une question spécifique sur la manière dont vous souhaitez améliorer la photo.</p>
    <h2>2. Respect et Professionnalisme</h2>
    <p>Tous les échanges sur ce forum doivent se faire dans le respect et la courtoisie. Les critiques constructives sont encouragées, mais toujours formulées avec bienveillance.</p>
    <h2>3. Confidentialité et Droit d’Auteur</h2>
    <p>Ne postez que des photos dont vous détenez les droits. Respectez la vie privée des autres et ne partagez pas d'images pouvant porter atteinte à la confidentialité ou aux droits d'une tierce personne.</p>
    <h2>4. Sécurité en Ligne</h2>
    <p>Soyez conscient que, personne n'est introuvable sur Internet. Tout ce qui est posté est stocké et traçable. En cas de contenu répréhensible, des plaintes peuvent être engagées.</p>
    <h2>5. Consentement pour les Modifications</h2>
    <p>En partageant vos photos, vous donnez implicitement aux membres du forum la permission de proposer des modifications ou des ajustements. Si vous n'êtes pas à l'aise avec cela, veuillez l'indiquer clairement dans votre publication.</p>
    <h2>6. Usage des Contenus</h2>
    <p>Les conseils et modifications proposés par les professionnels et les membres sont destinés à un usage éducatif et ne doivent pas être utilisés à des fins commerciales sans permission explicite.</p>
    <h2>7. Participation Active</h2>
    <p>Nous encourageons tous les membres à participer activement, non seulement en partageant leurs propres photos mais aussi en offrant des retours constructifs aux autres.</p>
    <h2>8. Règles Additionnelles</h2>
    <p>Le forum se réserve le droit d'ajouter, de modifier ou de supprimer des règles pour le bien-être de la communauté.</p>
    <p>Le non-respect de ces règles peut entraîner des avertissements, la suppression de contenu, l'exclusion du forum ou dans des cas graves, un procès. Nous sommes ici pour grandir ensemble dans notre passion pour la photographie, donc apportons tous notre pierre à l'édifice pour créer un environnement respectueux et enrichissant.</p>
    </div>
    </div>
  );
}