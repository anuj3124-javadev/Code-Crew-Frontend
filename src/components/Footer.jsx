import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-logo">
            <span className="logo-icon">🚀</span>
            CodeCrew
          </h3>
          <p className="footer-description">
            Building amazing projects with talented teams. Showcasing innovation and collaboration.
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/projects" className="footer-link">Projects</Link>
          <Link to="/team" className="footer-link">Our Team</Link>
        </div>

        <div className="footer-section">
          <h4>Resources</h4>
          <a href="#" className="footer-link">Documentation</a>
          <a href="#" className="footer-link">Support</a>
          <a href="#" className="footer-link">API Status</a>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p className="footer-contact">Email: codecrew@company.com</p>
          <p className="footer-contact">Phone: 000000000</p>
          <p className="footer-contact">Address: Uttar Pradesh, India</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 CodeCrew. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;