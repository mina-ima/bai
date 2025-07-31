import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "warn", // 未使用変数は警告に
      "@typescript-eslint/no-empty-object-type": "off", // 空のオブジェクト型を許可
      "@typescript-eslint/no-unnecessary-type-constraint": "off", // 不要な型制約を許可
      "@typescript-eslint/no-wrapper-object-types": "off", // ラッパーオブジェクト型を許可
      "@typescript-eslint/no-unsafe-function-type": "off", // unsafeな関数型を許可
      "@typescript-eslint/no-this-alias": "off", // thisのエイリアスを許可
    },
  },
];

export default eslintConfig;
