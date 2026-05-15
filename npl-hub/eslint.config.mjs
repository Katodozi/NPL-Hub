import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Downgrade to warnings — these don't affect functionality
      "@next/next/no-img-element":       "warn",
      "react/no-unescaped-entities":     "warn",
      "react-hooks/exhaustive-deps":     "warn",
    },
  },
];

export default eslintConfig;