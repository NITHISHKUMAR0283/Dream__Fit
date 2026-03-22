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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.253 2 11.5c0 2.03.67 3.91 1.813 5.446L2.5 22l5.26-1.374A10.23 10.23 0 0012 21c5.523 0 10-4.253 10-9.5S17.523 2 12 2zm0 17c-1.362 0-2.66-.34-3.797-.95l-.272-.145-3.122.815.835-3.037-.177-.283A7.279 7.279 0 014.5 11.5C4.5 7.36 7.86 4 12 4s7.5 3.36 7.5 7.5S16.14 19 12 19zm4.12-5.29c-.226-.113-1.34-.66-1.548-.735-.207-.076-.358-.113-.508.113-.15.226-.583.735-.715.886-.132.15-.264.17-.49.056-.226-.113-.954-.351-1.818-1.12-.672-.6-1.126-1.341-1.258-1.567-.132-.226-.014-.348.099-.46.101-.1.226-.264.339-.396.113-.132.15-.226.226-.377.075-.15.037-.282-.02-.396-.056-.113-.508-1.224-.696-1.677-.183-.44-.37-.38-.508-.387l-.433-.007c-.151 0-.396.056-.603.282-.207.226-.79.773-.79 1.884s.809 2.184.922 2.335c.113.15 1.592 2.43 3.857 3.407.539.233.96.372 1.288.476.541.172 1.033.148 1.422.09.434-.064 1.34-.547 1.53-1.075.188-.528.188-.98.131-1.075-.056-.094-.207-.15-.433-.263z"/>
              </svg>
            }
            label="WhatsApp"
            href="https://wa.me/918807043986"
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
