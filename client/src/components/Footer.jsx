import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div className="text-slate-400/80 pt-8 px-6 md:px-16 lg:px-24 xl:px-32">
      <div className="flex flex-wrap justify-between gap-12 md:gap-6">
        <div className="max-w-80">
          <img src={assets.logo} alt="logo" className="h-28 md:h-32" />
          <p className="max-w-80 mt-3">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
          </p>
          <div className="flex items-center gap-3 mt-4">
            <a href="#">
              <img src={assets.facebook_logo} alt="" className="w-5 h-5" />
            </a>
            <a href="#">
              <img src={assets.instagram_logo} alt="" className="w-5 h-5" />
            </a>
            <a href="#">
              <img src={assets.twitter_logo} alt="" className="w-5 h-5" />
            </a>
            <a href="#">
              <img src={assets.gmail_logo} alt="" className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-base font-medium text-white">Quick Links</h2>
          <ul className="mt-3 flex flex-col gap-1.5">
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#">Browse Cars</a>
            </li>
            <li>
              <a href="#">List Your Car</a>
            </li>
            <li>
              <a href="#">About us</a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-medium text-white">Resources</h2>
          <ul className="mt-3 flex flex-col gap-1.5">
            <li>
              <a href="#">Help Center</a>
            </li>
            <li>
              <a href="#">Terms of Services</a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Insurance</a>
            </li>
          </ul>
        </div>
      </div>
      <hr className="border-slate-600 mt-8" />
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between py-5">
        <p>
          © {new Date().getFullYear()} <a href="/">DriveNest</a>. All rights
          reserved.
        </p>
        <ul className="flex items-center gap-4">
          <li>
            <a href="#">Privacy</a>
          </li>
          <li>
            <a href="#">Terms</a>
          </li>
          <li>
            <a href="#">Sitemap</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Footer;
