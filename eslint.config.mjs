import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),

  {
    rules: {
      /*
       * El guión bajo delante de un parámetro significa "esto existe porque lo
       * exige la firma, y aún no se usa".
       *
       * Hace falta por el adaptador remoto de calendario
       * (`features/reservas/lib/calendario/remoto.ts`): implementa el contrato
       * de `ProveedorCalendario` con los métodos marcados `TODO` a la espera de
       * que se decida el proveedor. Sus parámetros TIENEN que estar declarados
       * —son el contrato— y todavía no se usan.
       *
       * Sin esta regla eran cinco avisos permanentes, y unos avisos que siempre
       * están ahí son avisos que nadie lee: el día que aparezca uno de verdad se
       * pierde entre ellos.
       */
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
