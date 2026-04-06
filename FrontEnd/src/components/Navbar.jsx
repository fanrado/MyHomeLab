import React, { useState, useEffect } from 'react';

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
      <a href="/" className="navbar-brand">MyHomeLab</a>

      <div className="navbar-clock">
        <span className="navbar-clock-date">{dateStr}</span>
        <span className="navbar-clock-time">{timeStr}</span>
      </div>

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
