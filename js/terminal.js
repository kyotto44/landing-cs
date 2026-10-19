/*
 * Terminal animada.
 * Cuando la consola entra en pantalla, los comandos se escriben letra por letra y la
 * última línea (la "salida" del programa, marcada con data-salida) aparece de una vez,
 * como en una terminal real. Todo se hace sobre el texto que ya está en el HTML:
 * sin JavaScript, o con "reducir movimiento" activado, la consola se ve completa y quieta.
 *
 * Accesibilidad: antes de animar se crea una copia invisible del texto completo para
 * lectores de pantalla, y la versión animada se marca aria-hidden para que no se lea
 * a medias. Las líneas que faltan por escribir conservan su espacio (visibility: hidden),
 * así que la consola no cambia de alto mientras se escribe.
 */
(function () {
  "use strict";

  var cuerpo = document.querySelector("[data-terminal]");
  if (!cuerpo) return;

  var reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducirMovimiento || !("IntersectionObserver" in window)) return;

  var cursor = cuerpo.querySelector(".cursor");
  var parrafos = Array.prototype.slice.call(cuerpo.querySelectorAll("p"));
  if (!cursor || !parrafos.length) return;

  // 1. Copia accesible con el texto completo (sin el carácter del cursor).
  var copia = cuerpo.cloneNode(true);
  copia.removeAttribute("data-terminal");
  copia.className = "visualmente-oculto";
  var cursorCopia = copia.querySelector(".cursor");
  if (cursorCopia) cursorCopia.parentNode.removeChild(cursorCopia);
  cuerpo.parentNode.insertBefore(copia, cuerpo.nextSibling);
  cuerpo.setAttribute("aria-hidden", "true");

  // 2. Cada línea queda como: prompt + texto escrito + texto pendiente (invisible).
  cursor.parentNode.removeChild(cursor);

  var lineas = parrafos.map(function (parrafo) {
    var prompt = parrafo.querySelector(".prompt, .prompt-exito");
    var texto = "";
    Array.prototype.forEach.call(parrafo.childNodes, function (nodo) {
      if (nodo.nodeType === Node.TEXT_NODE) texto += nodo.textContent;
    });

    // El espacio tras el prompt se conserva; solo se "teclea" el comando.
    var prefijo = /^\s/.test(texto) ? " " : "";
    var comando = texto.replace(/^\s+/, "");

    var escrito = document.createElement("span");
    escrito.textContent = prefijo;
    var pendiente = document.createElement("span");
    pendiente.className = "texto-pendiente";
    pendiente.textContent = comando;

    while (parrafo.firstChild) parrafo.removeChild(parrafo.firstChild);
    if (prompt) parrafo.appendChild(prompt);
    parrafo.appendChild(escrito);
    parrafo.appendChild(pendiente);
    parrafo.classList.add("linea-pendiente");

    return {
      parrafo: parrafo,
      escrito: escrito,
      pendiente: pendiente,
      prefijo: prefijo,
      comando: comando,
      esSalida: parrafo.hasAttribute("data-salida"),
    };
  });

  // Estado inicial: solo la primera línea, con el prompt y el cursor esperando.
  function mostrarLinea(linea) {
    linea.parrafo.classList.remove("linea-pendiente");
    linea.parrafo.insertBefore(cursor, linea.pendiente);
  }
  mostrarLinea(lineas[0]);

  // 3. Escritura: una pausa corta entre líneas y un ritmo de tecleo con algo de variación.
  var PAUSA_INICIAL = 350;
  var PAUSA_ENTRE_LINEAS = 320;
  var PAUSA_ANTES_DE_SALIDA = 450;

  function retrasoTecla() {
    return 26 + Math.random() * 42;
  }

  function terminar() {
    var ultima = lineas[lineas.length - 1];
    ultima.parrafo.appendChild(cursor);
    cuerpo.classList.remove("escribiendo");
  }

  function escribirLinea(indice) {
    if (indice >= lineas.length) {
      terminar();
      return;
    }

    var linea = lineas[indice];
    mostrarLinea(linea);

    // La salida del programa no se teclea: aparece completa.
    if (linea.esSalida) {
      linea.escrito.textContent = linea.prefijo + linea.comando;
      linea.pendiente.textContent = "";
      escribirLinea(indice + 1);
      return;
    }

    var posicion = 0;
    function tecla() {
      posicion += 1;
      linea.escrito.textContent = linea.prefijo + linea.comando.slice(0, posicion);
      linea.pendiente.textContent = linea.comando.slice(posicion);

      if (posicion < linea.comando.length) {
        window.setTimeout(tecla, retrasoTecla());
        return;
      }

      var siguiente = lineas[indice + 1];
      var pausa = siguiente && siguiente.esSalida ? PAUSA_ANTES_DE_SALIDA : PAUSA_ENTRE_LINEAS;
      window.setTimeout(function () {
        escribirLinea(indice + 1);
      }, pausa);
    }
    tecla();
  }

  // 4. Empieza una sola vez, cuando al menos la mitad de la consola es visible.
  var observador = new IntersectionObserver(
    function (entradas) {
      if (!entradas.some(function (entrada) { return entrada.isIntersecting; })) return;
      observador.disconnect();
      window.setTimeout(function () {
        cuerpo.classList.add("escribiendo");
        escribirLinea(0);
      }, PAUSA_INICIAL);
    },
    { threshold: 0.5 }
  );
  observador.observe(cuerpo);
})();
