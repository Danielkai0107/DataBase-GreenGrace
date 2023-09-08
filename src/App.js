import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import ImageDB from './page/ImageDB';
import ProductsDB from './page/ProductsDB';
import Navbar from './components/Navbar';



function App() {
  return (
    <Router>
      <Navbar/>
    <Routes>
      <Route path="/" element={<ProductsDB/>} />
      <Route path="/2" element={<ImageDB/>} />
    </Routes>
  </Router>
  )
}

export default App
