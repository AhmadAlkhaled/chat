import { RouterProvider } from 'react-router-dom';
import axios from 'axios';
import router from './utils/router.jsx';

function App() {
  axios.defaults.baseURL = 'http://localhost:4040';
  axios.defaults.withCredentials = true;

  

  return (
    <div className='bg-bgDark'>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
