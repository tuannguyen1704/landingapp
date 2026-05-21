import React from 'react';

export default function Footer() {
  return (
    <footer className="py-16 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
        {['San pham', 'Giai phap', 'Cong ty', 'Lien he'].map((col) => (
          <div key={col}>
            <h4 className="font-bold mb-6 text-gray-400">{col}</h4>
            <ul className="space-y-4 text-gray-500">
              <li>Linh kien</li>
              <li>Tu dong hoa</li>
              <li>Bas dan</li>
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-800 text-gray-500 text-sm">
        &copy; 2026 Powered by Mecsu AI
      </div>
    </footer>
  );
}
