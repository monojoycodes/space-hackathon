
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['Space Grotesk', 'system-ui', 'sans-serif'],
			},
			screens: {
				'xs': '475px',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				space: {
					'blue': '#3B82F6',
					'dark-blue': '#EBF4FF',
					'darker-blue': '#F8FAFC',
					'red': '#EF4444',
					'green': '#10B981',
					'yellow': '#F59E0B',
					'gray': '#4B5563',
					'purple': '#8B5CF6',
					'cosmic': '#6D28D9',
					'nebula': '#9333EA',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0',
						opacity: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)',
						opacity: '1'
					},
					to: {
						height: '0',
						opacity: '0'
					}
				},
				'pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},
				'spin': {
					to: { transform: 'rotate(360deg)' }
				},
				'ping': {
					'75%, 100%': { transform: 'scale(2)', opacity: '0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'twinkle': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.3', transform: 'scale(1.2)' }
				},
				'orbit': {
					'0%': { transform: 'rotate(0deg) translateX(80px) rotate(0deg)' },
					'100%': { transform: 'rotate(360deg) translateX(80px) rotate(-360deg)' }
				},
				'spin-reverse': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(-360deg)' }
				},
				'nebula-glow': {
					'0%, 100%': { 
						opacity: '0.3',
						boxShadow: '0 0 30px 10px rgba(138, 43, 226, 0.4)'
					},
					'50%': { 
						opacity: '0.6',
						boxShadow: '0 0 40px 15px rgba(138, 43, 226, 0.6)'
					}
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'shooting-star': {
					'0%': {
						transform: 'rotate(215deg) translateX(0)',
						opacity: '1'
					},
					'70%': { opacity: '1' },
					'100%': {
						transform: 'rotate(215deg) translateX(500px)',
						opacity: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'spin': 'spin 1s linear infinite',
				'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
				'float': 'float 4s ease-in-out infinite',
				'twinkle': 'twinkle 2s ease-in-out infinite',
				'orbit': 'orbit 20s linear infinite',
				'spin-reverse': 'spin-reverse 3s linear infinite',
				'nebula-glow': 'nebula-glow 8s ease-in-out infinite',
				'shimmer': 'shimmer 1.5s infinite',
				'shooting-star': 'shooting-star 5s linear infinite'
			},
			transitionProperty: {
				'height': 'height',
				'spacing': 'margin, padding',
			},
			backdropBlur: {
				'xs': '2px',
			},
			boxShadow: {
				'glow': '0 0 10px 3px rgba(59, 130, 246, 0.5)',
				'cosmic': '0 0 15px 5px rgba(124, 58, 237, 0.6)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
