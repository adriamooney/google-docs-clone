import ReactQuill from 'react-quill-new';
import React, {useRef, useEffect, useState} from 'react';
import { throttle } from 'lodash';
import { setDoc, doc, getDoc, onSnapshot } from 'firebase/firestore';
import {db} from '../firebaseConfig';
import 'react-quill-new/dist/quill.snow.css';

export const TextEditor = () => {

    const quillRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);

    const isLocalChange = useRef(false);

    const documentRef = doc(db, 'documents', 'sample-doc');

    const saveContent = throttle(() => {
        if(quillRef.current) {
            const content = quillRef.current.getEditor().getContents();
            console.log(`saving content to db:`, content); 

            setDoc(documentRef, {content: content.ops}, {merge: true})
                .then(() => console.log('content saved'))
                .catch(console.error);
            isLocalChange.current = false;
        }
    }, 1000);

    useEffect(() => {
        if(quillRef.current) {
            //Load initital content from firestore

            getDoc(documentRef).then((docSnap) =>{
                if(docSnap.exists()) {
                    const savedContent = docSnap.data().content;
                    if( savedContent ) {
                        quillRef.current.getEditor().setContents(savedContent);
                    }
                    else {
                        console.log('no doc found, starting with an empty editor')
                    }
                }
            }).catch(console.error);

            // listen to firestore for updates and update locally

            const unsubscribe = onSnapshot(documentRef, (snapshot) => {
                if(snapshot.exists()) {
                    const newContent = snapshot.data().content
                
                    if (!isEditing) {
                        const editor = quillRef.current.getEditor()
                        const currentCursorPosition = editor.getSelection()?.index || 0

                        editor.setContents(newContent, 'silent');
                        editor.setSelection(currentCursorPosition);
                    }
                }
            })


            // listen for local changes and save to firestore
            const editor = quillRef.current.getEditor();
            editor.on('text-change', (delta, oldDelta, source) => {

                //check if the editor is being changed by this user
                if (source === 'user') {
                    isLocalChange.current = true;
                    setIsEditing(true);
                    saveContent();
    
                    setTimeout(() => setIsEditing(false), 5000);
                }

            });

            return() => {
                unsubscribe();
                editor.off("text-change");
            }
        }
    }, [])

    return (
        <div className="google-docs-editor">
            <ReactQuill ref={quillRef} />
        </div>
    );
}

export default TextEditor;