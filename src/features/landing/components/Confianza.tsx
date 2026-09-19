import type { Diccionario } from "@/shared/i18n/esquema";

/**
 * Franja de confianza. Cuatro afirmaciones que se pueden sostener hoy: no
 * hay contadores de estudiantes ni años de experiencia, porque el negocio
 * arranca y esos números no existen.
 */
export function Confianza({ t }: { t: Diccionario }) {
  const puntos = [
    {
      titulo: t.confianza.profesorTitulo,
      texto: t.confianza.profesorTexto,
      icono: <IconoPersona />,
    },
    {
      titulo: t.confianza.horarioTitulo,
      texto: t.confianza.horarioTexto,
      icono: <IconoReloj />,
    },
    {
      titulo: t.confianza.reservaTitulo,
      texto: t.confianza.reservaTexto,
      icono: <IconoEscudo />,
    },
    {
      titulo: t.confianza.culturaTitulo,
      texto: t.confianza.culturaTexto,
      icono: <IconoGlobo />,
    },
  ];

  return (
    <section className="confianza">
      <ul className="confianza__lista">
        {puntos.map((punto) => (
          <li key={punto.titulo} className="confianza__punto">
            <span className="confianza__icono" aria-hidden="true">
              {punto.icono}
            </span>
            <span>
              <strong>{punto.titulo}</strong>
              <span className="confianza__texto">{punto.texto}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const trazo = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconoPersona() {
  return (
    <svg viewBox="0 0 24 24" {...trazo}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  );
}

function IconoReloj() {
  return (
    <svg viewBox="0 0 24 24" {...trazo}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconoEscudo() {
  return (
    <svg viewBox="0 0 24 24" {...trazo}>
      <path d="M12 3l7 3v6c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconoGlobo() {
  return (
    <svg viewBox="0 0 24 24" {...trazo}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.8 2.5 15.2 0 18M12 3c-2.5 2.8-2.5 15.2 0 18" />
    </svg>
  );
}
