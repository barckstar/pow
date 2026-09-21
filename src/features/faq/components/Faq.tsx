import type { FAQPage, WithContext } from "schema-dts";
import { FAQ } from "../esquema";
import type { Idioma } from "@/shared/i18n/config";
import type { Diccionario } from "@/shared/i18n/esquema";
import { DecoradosSeccion } from "@/shared/components/ui/DecoradosSeccion";

/**
 * Preguntas frecuentes.
 *
 * Con `<details>`/`<summary>` nativos: abren y cierran sin una línea de
 * JavaScript, funcionan con teclado y lector de pantalla por defecto, y su
 * contenido es texto plano en el HTML, así que Google lo indexa aunque esté
 * plegado. Un acordeón hecho a mano habría costado un componente de cliente
 * y habría que haberle puesto el ARIA a mano.
 */
export function Faq({ lang, t }: { lang: Idioma; t: Diccionario }) {
  /*
   * El JSON-LD solo lleva las preguntas con respuesta completa. Google exige
   * que la respuesta esté ahí entera para dar el resultado enriquecido, y
   * marcar un "todavía no lo sabemos" como FAQPage es pedir una penalización.
   */
  const respondidas = FAQ.filter((p) => !p.pendiente);

  const jsonLd: WithContext<FAQPage> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: respondidas.map((p) => ({
      "@type": "Question",
      name: p.pregunta[lang],
      acceptedAnswer: { "@type": "Answer", text: p.respuesta[lang] },
    })),
  };

  return (
    <section className="seccion con-adornos" aria-labelledby="faq-titulo">
      <DecoradosSeccion variante="faq" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="seccion__interior seccion__interior--estrecho">
        <h2 className="seccion__titulo" id="faq-titulo">
          {t.faq.titulo}
        </h2>
        <p className="seccion__intro">{t.faq.intro}</p>

        <div className="faq">
          {FAQ.map((p) => (
            <details key={p.id} className="faq__item" id={p.id}>
              <summary className="faq__pregunta">
                <span>{p.pregunta[lang]}</span>
                <span className="faq__signo" aria-hidden="true" />
              </summary>
              <div className="faq__respuesta">
                <p>{p.respuesta[lang]}</p>
                {p.pendiente ? (
                  <p className="faq__pendiente">
                    <span className="pendiente">{t.pendiente.etiqueta}</span>
                  </p>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
