import { APP_DESCRIPTION, APP_NAME, APP_VERSION } from '../../utils/constants';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="border-t mt-auto"
      style={{
        background: 'color-mix(in srgb, var(--bg) 60%, transparent)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--brand)] to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold" aria-hidden="true">
                  🛡
                </span>
              </div>
              <span className="font-bold" style={{ color: 'var(--text)' }}>
                {APP_NAME}
              </span>
            </div>
            <p
              className="text-sm max-w-md"
              style={{ color: 'var(--text-muted)' }}
            >
              {APP_DESCRIPTION} Verify text, URLs, and images with multi-model
              analysis and trusted source cross-referencing.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>
              Product
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li><a href="#features" className="hover:underline">Features</a></li>
              <li><a href="#how" className="hover:underline">How it works</a></li>
              <li><a href="/api/docs" className="hover:underline">API</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>
              Legal
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li><a href="#privacy" className="hover:underline">Privacy</a></li>
              <li><a href="#terms" className="hover:underline">Terms</a></li>
              <li><a href="#contact" className="hover:underline">Contact</a></li>
            </ul>
          </div>
        </div>
        <div
          className="mt-8 pt-6 border-t text-center text-xs"
          style={{
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-subtle)',
          }}
        >
          © {year} {APP_NAME} v{APP_VERSION}. Built with React, FastAPI, and MongoDB.
        </div>
      </div>
    </footer>
  );
}
