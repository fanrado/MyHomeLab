import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

function Navbar() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">MyHomeLab</Link>

      <div className="navbar-clock">
        <span className="navbar-clock-date">{dateStr}</span>
        <span className="navbar-clock-time">{timeStr}</span>
      </div>

      <ul className="navbar-links">
        <li><NavLink to="/" end>Home</NavLink></li>
        <li><NavLink to="/github">Github</NavLink></li>
        <li><NavLink to="/apps">Apps</NavLink></li>
        <li><NavLink to="/hardware">Hardware</NavLink></li>
        <li><NavLink to="/dashboard">Dashboard</NavLink></li>
      </ul>
    </nav>
  );
}

export default Navbar;
