import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-outline-variant/30 mt-20">
      <div className="w-full py-12 px-margin-desktop max-w-container-max-width mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-body-lg font-headline-md text-on-surface font-bold tracking-tighter">Equinox</span>
          <p className="font-label-md text-label-md text-secondary dark:text-secondary opacity-60">
            © {new Date().getFullYear()} Equinox Invoicing. Precision billing for freelancers.
          </p>
        </div>
        <nav className="flex gap-8 font-label-md text-label-md">
          <Link to="/" className="text-on-secondary-container hover:text-primary transition-colors">Home</Link>
          <Link to="/pricing" className="text-on-secondary-container hover:text-primary transition-colors">Pricing</Link>
          <a href="#" className="text-on-secondary-container hover:text-primary transition-colors">Terms</a>
          <a href="#" className="text-on-secondary-container hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="text-on-secondary-container hover:text-primary transition-colors">Support</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
