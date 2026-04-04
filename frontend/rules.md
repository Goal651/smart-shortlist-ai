# Project Styling & Component Rules

## 1. Tailwind CSS Strategy
- **Component-Based**: Use reusable components for all common UI elements.
- **No Hardcoded Styles**: Avoid using arbitrary values (e.g., `text-[#123456]` or `h-[123px]`) in layout files. Use tokens/theme variables.
- **Tailwind v4**: Configuration should be handled in CSS via `@theme` where possible.

## 2. Typography
- **Primary Fonts**: 
  - `DM Sans` (for Headings/Accents)
  - `Work Sans` (for Body/General text)
- **Font Weights**: 
  - Maximum weight: `font-semibold`.
  - **No `font-bold`** or heavier.
  - Recommended range: `font-light`, `font-normal`, `font-medium`, `font-semibold`.
- **Sizes**: Use standard Tailwind scale (`text-sm`, `text-base`, etc.).

## 3. Color Palette
- **No Low Contrast Text**: Do not use `text-gray-400`, `text-gray-500`, or lighter for any text content. Minimum shade for secondary text is `text-gray-600`.
 - Tailwind Utility: `bg-primary`, `text-primary`

## 4. Components & Forms
- **Input Fields**: Must always use a dedicated `Input` component. No raw `<input>` tags with utility classes scattered around.
- **Buttons**: Must use a dedicated `Button` component reflecting the brand blue.
- **Consistency**: Every new feature must check this `rules.md` to ensure design alignment.

## 5. Modern Aesthetics
- **No Shadows**: Do not use `shadow-sm`, `shadow-md`, etc. Maintain a flat/clean look.
- **Increased Spacing**: Focus on generous padding and whitespace.
- **Rounded Corners**: Use `rounded-lg` or `rounded-xl` for components.
- **No Hover Effects**: Interactive elements should not change visually on hover (bg, text, or scale). Maintain a static/flat feel.
- **Improved Typography**: Match mockup font sizes and weights precisely.
