import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="error-page">
        <div className="error-block">
          <span className="error-stamp">NO RECORD FOUND</span>
          <p className="error-code">404</p>
          <h1 className="error-title">This file isn't in the archive</h1>
          <p className="error-body">
            The page you're looking for doesn't exist, got moved, or never made it out of testing. Command wasn't
            able to locate it.
          </p>
          <div className="error-actions">
            <Link to="/" className="btn">Back to home</Link>
            <Link to="/#archive" className="btn btn-ghost">Browse the archive</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
