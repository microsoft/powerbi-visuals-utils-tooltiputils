import js from "@eslint/js";
import tseslint from "typescript-eslint";
import powerbiVisualsPlugin from "eslint-plugin-powerbi-visuals";

export default [
    {
        ignores: [
            "node_modules/**",
            "dist/**",
            "coverage/**",
            "test/**",
            "lib/**",
            ".tmp/**",
            "eslint.config.mjs"
        ]
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    powerbiVisualsPlugin.configs.recommended,
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-inferrable-types": "off",
            "no-useless-assignment": "off"
        }
    }
];
