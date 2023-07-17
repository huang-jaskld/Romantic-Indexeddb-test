import { useEffect } from 'react';
import './App.css';
import { createConnection } from "./libs/index"
import User from "./stores/User"
import { RepositoryWrite } from './libs/repository';


function App() {
  useEffect(() => {
    createConnection({
      dbName: "Indexeddb-1",
      dbVersion: 3,
      objectStores: [User]
    }).then(connection => {
      let rep = connection.getRepository(User, "readwrite") as RepositoryWrite
      // rep.add({ user_name: "小王", age: 18 })
      // rep.add({ user_name: "小李", age: 19 })
      rep.getAllByIndex("age", (record: any) => record.age === 19).then(res => console.log(res))
    })
  }, [])
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
