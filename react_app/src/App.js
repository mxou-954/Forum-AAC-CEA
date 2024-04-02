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

function App() {
  return (
    <UserProvider>
    <div className="App">
    <div className='body'>
    <Navbar></Navbar>
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/LogIn' element={<LogIn />} />
        <Route path='/SignIn' element={<SignIn />} />
        <Route path='/Test' element={<Test />} />
        <Route path='/Contact' element={<Contact /> } />
      </Routes>
    </main>
    </div>
    </div>
    </UserProvider>
  );
}

export default App;
