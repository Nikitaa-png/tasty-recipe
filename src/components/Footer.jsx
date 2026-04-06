import { useNavigate } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">🍴 Tasty Recipe</div>
          <p className="footer-tagline">
            Discover, cook, and share delicious recipes from around the world.
            Your kitchen, your story.
          </p>
          <div className="footer-socials">
            <a href="mailto:contact@tastyrecipe.com" className="social-btn" aria-label="Email">📧</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-btn" aria-label="Instagram">📸</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-btn" aria-label="Twitter">🐦</a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-btn" aria-label="YouTube">▶️</a>
          </div>
        </div>

        {/* Quick links */}
        <div className="footer-col">
          <h4 className="footer-heading">Explore</h4>
          <ul className="footer-links">
            <li><button onClick={() => navigate('/home')}>🏠 Home</button></li>
            <li><button onClick={() => navigate('/home?tab=popular')}>🔥 Popular Dishes</button></li>
            <li><button onClick={() => navigate('/home?tab=favorites')}>❤️ My Favourites</button></li>
            <li><button onClick={() => navigate('/profile')}>👤 My Profile</button></li>
          </ul>
        </div>

        {/* Cuisines */}
        <div className="footer-col">
          <h4 className="footer-heading">Cuisines</h4>
          <ul className="footer-links">
            {['🇮🇳 Indian','🇮🇹 Italian','🇯🇵 Japanese','🇲🇽 Mexican','🇨🇳 Chinese','🇬🇷 Greek'].map(c => (
              <li key={c}><span>{c}</span></li>
            ))}
          </ul>
        </div>

        {/* Fun facts */}
        <div className="footer-col">
          <h4 className="footer-heading">Did you know?</h4>
          <ul className="footer-facts">
            <li>🍛 India has 30+ regional cuisines</li>
            <li>🌶️ Chilli was introduced to India by Portuguese</li>
            <li>🍚 Rice is eaten by 65% of the world daily</li>
            <li>🧄 Garlic has been used in cooking for 7,000 years</li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-left">
          Made with ❤️ and lots of 🍛 · © {year} Tasty Recipe
        </div>
        <div className="footer-bottom-right">
          <span onClick={() => navigate('/privacy')}>🔒 Privacy Policy</span>
          <span onClick={() => navigate('/terms')}>📄 Terms of Use</span>
          <span onClick={() => navigate('/contact')}>📬 Contact Us</span>
        </div>
      </div>
    </footer>
  );
}
