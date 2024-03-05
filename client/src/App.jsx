import { RouterProvider } from 'react-router-dom';
import axios from 'axios';
import router from './utils/router.jsx';
import {config} from '../config.js';

const env = process.env.NODE_ENV ;
const configOptions = config[env];

function App() {
  axios.defaults.baseURL = configOptions.SERVER_URL;
  axios.defaults.withCredentials = true;


  

  return (
    <div className='bg-bgDark'>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
