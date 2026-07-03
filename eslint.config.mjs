import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"
import prettier from "eslint-config-prettier/flat"

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  prettier,
  {
    ignores: [
      ".next/**",
      "android/**",
      "coverage/**",
      "node_modules/**",
      "out/**",
      "public/apk/**",
      "supabase/.branches/**",
      "supabase/.temp/**",
    ],
  },
  {
    rules: {
      "@next/next/no-img-element": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
]

export default eslintConfig
