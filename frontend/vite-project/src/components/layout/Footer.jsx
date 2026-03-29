import React from "react";
import androidIcon from "../../assest/Android_icon-icons.com_60488.ico";
import appleIcon from "../../assest/social_apple_mac_65.png";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">

        {/* BRAND */}
        <div className="footer-brand">
          <div className="logo-mark logo-mark-sm">N</div>
          <span>NEWS MACHINE</span>
        </div>

        {/* COPYRIGHT */}
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} News Machine. All rights reserved.
        </p>

        {/* APP LINKS */}
        <div className="footer-apps">
          <span className="footer-apps-label">Get the app</span>

          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            className="app-badge"
          >
            <img src={androidIcon} alt="Android" />
            <span>Android</span>
          </a>

          <a
            href="https://www.apple.com/app-store/"
            target="_blank"
            rel="noopener noreferrer"
            className="app-badge"
          >
            <img src={appleIcon} alt="Apple" />
            <span>iOS</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;