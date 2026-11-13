// The sign-painters' faces (ui.css declares them). Signs are drawn on canvases at start-up, so the
// faces must have arrived first; main.js waits here, but never long.
export const F = {
  playfair: '"Playfair Display", Georgia, serif', abril: '"Abril Fatface", Georgia, serif', pacifico: 'Pacifico, "Brush Script MT", cursive',
  bebas: '"Bebas Neue", Impact, sans-serif', caveat: 'Caveat, "Bradley Hand", cursive', limelight: 'Limelight, Georgia, serif', dm: '"DM Serif Display", Georgia, serif',
  fraunces: 'Fraunces, Georgia, serif', shrikhand: 'Shrikhand, Georgia, serif', elite: '"Special Elite", "Courier New", monospace', yellowtail: 'Yellowtail, "Brush Script MT", cursive',
  archivo: '"Archivo Black", "Arial Black", sans-serif', goudy: '"Goudy House", Georgia, serif', sans: 'Helvetica, Arial, sans-serif',
};
const FACES = ['700 20px "Playfair Display"', 'italic 700 20px "Playfair Display"', '20px "Abril Fatface"', '20px Pacifico', '20px "Bebas Neue"', '600 20px Caveat', '20px Limelight', '20px "DM Serif Display"',
  '600 20px Fraunces', 'italic 600 20px Fraunces', '20px Shrikhand', '20px "Special Elite"', '20px Yellowtail', '20px "Archivo Black"', '20px "Goudy House"', 'italic 20px "Goudy House"'];
export function loadFonts(ms = 3500) {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  return Promise.race([Promise.all(FACES.map(f => document.fonts.load(f).catch(() => null))), new Promise(r => setTimeout(r, ms))]);
}
