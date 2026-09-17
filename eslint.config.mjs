// eslint-config-next v16 ships native flat configs, so no FlatCompat needed.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", "drizzle/meta/**"],
  },
  ...coreWebVitals,
  ...typescript,
];

export default eslintConfig;
