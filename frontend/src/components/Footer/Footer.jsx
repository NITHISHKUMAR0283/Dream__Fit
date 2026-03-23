import React from 'react';
import './Footer.css';

const SocialLink = ({ icon, label, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="social-link"
    title={label}
    aria-label={label}
  >
    {icon}
  </a>
);

const Footer = () => (
  <footer className="app-footer">
    <div className="footer-content">
      <div className="footer-section">
        <h3>About DreamFit</h3>
        <p>
          DreamFit is your trusted destination for premium fitness and lifestyle products. We bring you a curated selection with exceptional service, fast delivery, and a customer-first approach. Our mission is to make online shopping convenient, affordable, and inspiring for your fitness journey.
        </p>
      </div>

      <div className="footer-section">
        <h3>Connect With Us</h3>
        <div className="social-links">
            <SocialLink
              icon={
                <svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.828-2.05C13.47 27.633 14.72 28 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.13 0-2.238-.188-3.287-.558l-.235-.08-4.657 1.22 1.242-4.522-.153-.236C7.13 19.01 6 17.08 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.207-7.793c-.293-.146-1.734-.857-2.003-.954-.269-.098-.465-.146-.66.146-.195.293-.752.954-.97 1.15-.219.195-.366.22-.659.073-.293-.146-1.236-.455-2.355-1.45-.87-.776-1.457-1.734-1.63-2.027-.171-.293-.018-.451.128-.597.132-.132.293-.342.439-.513.146-.171.195-.293.293-.488.098-.195.049-.366-.024-.513-.073-.146-.659-1.586-.904-2.176-.237-.57-.48-.492-.66-.5l-.366-.007c-.22 0-.512.073-.78.366-.268.293-1.024 1.003-1.024 2.444s1.048 2.837 1.195 3.033c.146.195 2.063 3.154 5.006 4.426.7.303 1.247.484 1.673.619.703.224 1.342.193 1.847.117.565-.084 1.743-.713 1.991-1.401.246-.687.246-1.277.172-1.401-.073-.124-.269-.195-.565-.342z"/>
                </svg>
              }
              label="WhatsApp"
              href="#"
            />
          <SocialLink
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.07 1.645.07 4.849 0 3.205-.012 3.584-.07 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 110 2.881 1.44 1.44 0 010-2.881z"/>
              </svg>
            }
            label="Instagram"
            href="#"
          />
          <SocialLink
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            }
            label="Facebook"
            href="#"
          />
        </div>
      </div>

      <div className="footer-section">
        <h3>Why Choose Us?</h3>
        <ul>
          <li>✓ Premium Quality Products</li>
          <li>✓ Fast & Free Shipping</li>
          <li>✓ Easy Returns & Exchanges</li>
          <li>✓ 24/7 Customer Support</li>
        </ul>
      </div>
    </div>

    <div className="footer-bottom">
      <p>&copy; 2026 DreamFit. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
