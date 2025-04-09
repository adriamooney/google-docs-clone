import React, {useEffect} from 'react';
import {auth} from './firebaseConfig';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import './App.css'
import TextEditor from './components/TextEditor';

function App() {

  // tutorial
  // https://youtu.be/3XXLtpA1PKA?si=h7ruqNum1JeL_xz5

  useEffect(() => {
    signInAnonymously(auth);
    onAuthStateChanged(auth, user => {
      if(user) {
        console.log('user signed in ', user.uid)
      }
    })
  }, [])

  return (
    <div className="App">
      <header>
        <h1>Google Docs Clone</h1>
      </header>
      <TextEditor />
    </div>
  )
}

export default App
