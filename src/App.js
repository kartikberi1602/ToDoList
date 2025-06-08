import { useEffect, useState } from 'react';
import './App.css';
import { firebaseConfig } from './fireBaseConfig';
import LoginModal from './component/Login';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, remove, update } from "firebase/database";
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { BsCheckLg } from 'react-icons/bs';


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [addTitle, setTitle] = useState('');
  const [addDescription, setDescription] = useState('');
  const [errorMessasge, setErrorMessage] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [allTodoList, setAllTodoList] = useState([]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [loginPopUp, setloginPopUp] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [currentEditedItem, setCurrentEditedItem] = useState({ title: '', description: '' });
  const [currentUserName, setCurrentUserName] = useState('')

  const db = getDatabase(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUserName(user?.displayName)
      if (user) {
        setIsUserLoggedIn(true);
      } else {
        setIsUserLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const todoRef = ref(db, 'todos/' + user.uid);
    onValue(todoRef, (e) => {
      const data = e.val();
      const items = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : [];
      setAllTodoList(items);
    });
  }, [isUserLoggedIn]);

  const handleSubmit = () => {
    if (!isUserLoggedIn) {
      setloginPopUp(true);
      return;
    }

    if (!addTitle || !addDescription) {
      setErrorMessage('Title and Description required');
      return;
    }

    const user = auth.currentUser;
    const todoRef = ref(db, 'todos/' + user.uid);
    push(todoRef, {
      title: addTitle,
      description: addDescription,
      completed: false,
      createdAt: Date.now()
    });

    setTitle('');
    setDescription('');
    setErrorMessage('');
  };

  const handleDeleteTodo = (id) => {
    const user = auth.currentUser;
    const todoRef = ref(db, `todos/${user.uid}/${id}`);
    remove(todoRef);
  };

  const handleComplete = (id) => {
    const user = auth.currentUser;
    const todoRef = ref(db, `todos/${user.uid}/${id}`);
    update(todoRef, { completed: true, completedOn: new Date().toISOString() });
  };

  const handleEdit = (index, item) => {
    setCurrentEdit(index);
    setCurrentEditedItem({ title: item.title, description: item.description, id: item.id });
  };

  const handleUpdateTitle = (title) => {
    setCurrentEditedItem((prev) => ({ ...prev, title }));
  };

  const handleUpdateDescription = (description) => {
    setCurrentEditedItem((prev) => ({ ...prev, description }));
  };

  const handleUpdateToDo = () => {
    const user = auth.currentUser;
    const todoRef = ref(db, `todos/${user.uid}/${currentEditedItem.id}`);
    update(todoRef, {
      title: currentEditedItem.title,
      description: currentEditedItem.description
    });
    setCurrentEdit(null);
  };

  const handleClose = () => {
    setloginPopUp(false);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out.");
        setIsUserLoggedIn(false);
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  return (
    <div className="App">


      {isUserLoggedIn &&
        <div className='header'>
          <h3>Hello , {currentUserName}</h3>
          <button className='logutBtn' onClick={handleLogout}>Logout</button>
        </div>
      }
      <h1 className='page-title'>My Todo</h1>
      <div className='todo-container'>
        <div>{errorMessasge}</div>
        <div className='input_flex'>
          <div className='input_box'>
            <label className='input_label'>Title</label>
            <input type='text' placeholder='What is the Task Title' onChange={(e) => setTitle(e.target.value)} value={addTitle} />
          </div>
          <div className='input_box'>
            <label className='input_label'>Description</label>
            <input type='text' placeholder='What is Task Description' onChange={(e) => setDescription(e.target.value)} value={addDescription} />
          </div>
          <div className='input_box'>
            <button type='submit' className='handleSubmit' onClick={handleSubmit}>Add</button>
          </div>
        </div>
        <div className='button-group'>
          <button className={`tab_button ${isCompleted === false ? 'active' : ''}`} onClick={() => setIsCompleted(false)}>To Do</button>
          <button className={`tab_button ${isCompleted === true ? 'active' : ''}`} onClick={() => setIsCompleted(true)}>Completed</button>
        </div>

        <div className="todo-list">
          {isCompleted === false &&
            allTodoList.filter(item => !item.completed).map((item, index) => {
              if (currentEdit === index) {
                return (
                  <div className='edit__wrapper' key={index}>
                    <input placeholder='Updated Title'
                      onChange={(e) => handleUpdateTitle(e.target.value)}
                      value={currentEditedItem.title} />
                    <textarea placeholder='Updated Description'
                      rows={4}
                      onChange={(e) => handleUpdateDescription(e.target.value)}
                      value={currentEditedItem.description} />
                    <button
                      type="button"
                      onClick={handleUpdateToDo}
                      className="primaryBtn"
                    >
                      Update
                    </button>
                  </div>
                )
              } else {
                return (
                  <div className="todo-list-item" key={index}>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>

                    <div className='iconBox'>
                      <AiOutlineDelete
                        className="icon"
                        onClick={() => handleDeleteTodo(item.id)}
                        title="Delete?"
                      />
                      <BsCheckLg
                        className="check-icon"
                        onClick={() => handleComplete(item.id)}
                        title="Complete?"
                      />
                      <AiOutlineEdit className="check-icon"
                        onClick={() => handleEdit(index, item)}
                        title="Edit?" />
                    </div>
                  </div>
                );
              }
            })}

          {isCompleted === true &&
            allTodoList.filter(item => item.completed).map((item, index) => (
              <div className="todo-list-item" key={index}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <p><small>Completed on: {item.completedOn}</small></p>
                </div>

                <div className='iconBox'>
                  <AiOutlineDelete
                    className="icon"
                    onClick={() => handleDeleteTodo(item.id)}
                    title="Delete?"
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
      {loginPopUp && <LoginModal onClose={handleClose} />}
    </div>
  );
}

export default App;
