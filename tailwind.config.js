/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // eco tokens
        eco: {
          primary: "hsl(var(--eco-primary))",
          secondary: "hsl(var(--eco-secondary))",
          accent: "hsl(var(--eco-accent))",
          success: "hsl(var(--eco-success))",
        },
        achievement: {
          gold: "hsl(var(--achievement-gold))",
          silver: "hsl(var(--achievement-silver))",
          bronze: "hsl(var(--achievement-bronze))",
        },
      },
      boxShadow: {
        eco: "var(--shadow-eco)",
        card: "var(--shadow-card)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
      gradientColorStops: {
        // Not strictly required; gradients can use inline CSS variables
      },
    },
  },
  plugins: [],
};
