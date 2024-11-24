'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/shared/api/supabase';

export function NavBar() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const session = queryClient.getQueryData(['session']);
  const supabase = getSupabaseClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      queryClient.setQueryData(['session'], null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="nav-bar">
      <div className="nav-content">
        <Link href="/" className="nav-logo">
          GesturePic
        </Link>
        <div className="nav-links">
          <Link
            href="/studio"
            className={`nav-link ${pathname === '/studio' ? 'active' : ''}`}
          >
            Studio
          </Link>
          <Link
            href="/gallery"
            className={`nav-link ${pathname === '/gallery' ? 'active' : ''}`}
          >
            Gallery
          </Link>
          {session ? (
            <button onClick={handleSignOut} className="nav-button">
              Sign Out
            </button>
          ) : (
            <Link href="/auth" className="nav-button">
              Sign In
            </Link>
          )}
        </div>
      </div>
      <style jsx>{`
        .nav-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }
        .nav-content {
          max-width: 1200px;
          height: 100%;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-logo {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          text-decoration: none;
        }
        .nav-links {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        .nav-link {
          color: #666;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .nav-link:hover {
          color: #333;
          background: #f5f5f5;
        }
        .nav-link.active {
          color: #333;
          background: #f0f0f0;
        }
        .nav-button {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          background: #007aff;
          color: white;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
          text-decoration: none;
        }
        .nav-button:hover {
          background: #0056b3;
        }
      `}</style>
    </nav>
  );
}
