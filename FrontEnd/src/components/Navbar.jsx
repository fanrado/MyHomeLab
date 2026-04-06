import React from 'react';

function Navbar() {
  return (
    <nav className="navbar">
      <a href="/" className="navbar-brand">MyHomeLab</a>
      <ul className="navbar-links">
        <li><a href="/">Home</a></li>
        <li><a href="/services">Services</a></li>
        <li><a href="/network">Network</a></li>
        <li><a href="/monitoring">Monitoring</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;
