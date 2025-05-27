// src/components/Layout.tsx
import type { ReactNode } from 'react';
import logoImg from "../assets/logo.png";
import '../StyleCss/Layout.css';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }: { children: ReactNode }) {
    const location = useLocation(); // 👈 aktuelle URL
    const istStartseite = location.pathname === '/'; // 👈 Startseite erkennen
  
    return (
      <div className="dashboard">
        <header className="navbar">
          <img src={logoImg} alt="Neudorff" className="logo" />
          {istStartseite && (
            <span className="title">Neudorff Nützlinge | Bestell-Sets online einlösen</span>
          )}
        </header>
  
        <main className="content">
          {children}
        </main>
      </div>
    );
  }
