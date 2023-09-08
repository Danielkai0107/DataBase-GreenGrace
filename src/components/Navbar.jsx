// Navbar.js
import React, { memo }from 'react';
import { Link, useLocation } from 'react-router-dom';


function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar" >
      <ul>
        <li className="navbar-logo">
          <figure></figure>
          <Link className="nav-item" to="/" >DataBase</Link>
        </li>
        <li className="navbar-options">
          <Link className={`navbar-options-main ${location.pathname === "/" ? "active" : ""}`} to="/">ProductsDB</Link>
          <Link className={`navbar-options-main ${location.pathname === "/2" ? "active" : ""}`} to="/2">ImageDB</Link>

        </li>
      </ul>
    </nav>
  )
}

export default memo(Navbar);
