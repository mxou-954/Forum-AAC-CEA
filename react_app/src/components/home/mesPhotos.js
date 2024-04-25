import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import '../style/styles.css';

export default function PhotosEnregistrees() {


  return (
    <div className='mid_rules'> 
      <h1 className='title_rules'>Les photos que vous avez enregistrées :</h1>
      <div className="ligneHorizontale"></div>
      <div className='wrapper_images_enregistrees'>
        
        

      </div>
    </div>
  );
}