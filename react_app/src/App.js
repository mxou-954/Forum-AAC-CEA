import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './UserContext'; 
import Home from "./components/home/home";
import LogIn from "./components/home/LogIn";
import SignIn from "./components/home/SignIn";
import Test from "./components/home/test"
import Navbar from "./components/home/navbar"
import './components/style/styles.css'
import Contact from "./components/home/contact"
import Forum from "./components/home/forum"
import Regles from "./components/home/règles"
import ImageViewer from './components/home/ImageViewer'; 
import Options from './components/home/options';
import Mesphotos from './components/home/mesPhotos';
import Photosenregistrees from './components/home/photosEnregistrees';
import Legal from './components/home/legal';
import DossierPhotos from './components/home/dossierPhotos';
import DossierViewer from './components/home/dossierViewer';


function App() {
  return (
    <UserProvider>
    <div className="App">
    <div className='body'>
    <Navbar></Navbar>
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/forum' element={<Forum />} />
        <Route path="/image/:fileId" element={<ImageViewer />} />
        <Route path="/dossier_event/:fileId/:photoId" element={<DossierViewer />} />
        <Route path="/image/dossierEvenement/:fileId" element={<DossierPhotos />} />
        <Route path="/image/dossierEvenement/:fileId/:photo.photoId" element={<DossierPhotos />} />
        <Route path='/règles' element={<Regles />} />
        <Route path='/mesPhotos' element={<Mesphotos />} />
        <Route path='/photosEnregistrees' element={<Photosenregistrees />} />
        <Route path='/legal' element={<Legal />} />
        <Route path='/LogIn' element={<LogIn />} />
        <Route path='/SignIn' element={<SignIn />} />
        <Route path='/Test' element={<Test />} />
        <Route path='/Contact' element={<Contact /> } />
        <Route path='/Options' element={<Options /> } />
      </Routes>
    </main>
    </div>
    </div>
    </UserProvider>
  );
}

export default App;
