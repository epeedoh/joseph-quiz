/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        royal: '#1f3f8f',
        gold: '#d8b23f',
        teal: '#0d6d71',
        wine: '#9f2333',
        parchment: '#f6f1e7',
        ink: '#10213c'
      },
      fontFamily: {
        display: ['"Cinzel"', 'Georgia', 'serif'],
        body: ['"Manrope"', '"Segoe UI"', 'sans-serif'],
        accent: ['"Cormorant Garamond"', 'Georgia', 'serif']
      },
      boxShadow: {
        card: '0 24px 60px rgba(16, 33, 60, 0.15)'
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at top right, rgba(216, 178, 63, 0.28), transparent 38%), radial-gradient(circle at left center, rgba(13, 109, 113, 0.18), transparent 30%), linear-gradient(135deg, rgba(31, 63, 143, 0.95), rgba(16, 33, 60, 0.98))'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.75' },
          '50%': { opacity: '1' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 2.4s ease-in-out infinite',
        shimmer: 'shimmer 4s linear infinite'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
