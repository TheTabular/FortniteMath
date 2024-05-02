import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Navigation.css';

const Navigation = () => {
  return (
    <nav className="navigation">
      <ul className="navigation-list">
        <li className="navigation-item">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? "navigation-link active" : "navigation-link"}
          >
            Home
          </NavLink>
        </li>
        <li className="navigation-item">
          <NavLink 
            to="/play" 
            className={({ isActive }) => isActive ? "navigation-link active" : "navigation-link"}
          >
            Play
          </NavLink>
        </li>
        <li className="navigation-item">
          <NavLink 
            to="/healing-items" 
            className={({ isActive }) => isActive ? "navigation-link active" : "navigation-link"}
          >
            Heals
          </NavLink>
        </li>
        {/* Add more navigation items as needed */}
      </ul>
    </nav>
  );
};

export default Navigation;
