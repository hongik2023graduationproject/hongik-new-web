// Tailwind 3은 @tailwind/@apply 지시어가 있는 CSS(= 플레이그라운드 globals.css)에만 내용을 만든다.
// Starlight CSS는 지시어가 없어 autoprefixer만 거친다.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
