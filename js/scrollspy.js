/*
 * Scroll-spy: resalta en el menú la sección que se está leyendo.
 * Un IntersectionObserver vigila una franja horizontal delgada (entre el 35% y el 40%
 * del alto de la pantalla). La sección que cruza esa franja es la activa y su enlace
 * recibe aria-current="true", que el CSS usa para pintarlo y los lectores de pantalla
 * anuncian como "actual". No se escucha el evento scroll, así que no cuesta rendimiento.
 */
(function () {
  "use strict";

  if (!("IntersectionObserver" in window)) return;

  var enlaces = Array.prototype.slice.call(document.querySelectorAll('.menu a[href^="#"]'));
  if (!enlaces.length) return;

  // Secciones enlazadas desde el menú, más bloques intermedios que pertenecen a una de ellas
  // (por ejemplo, la consola bajo el hero se marca con data-espia="inicio").
  var vigilados = [];
  enlaces.forEach(function (enlace) {
    var seccion = document.getElementById(enlace.getAttribute("href").slice(1));
    if (seccion) vigilados.push(seccion);
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-espia]"), function (bloque) {
    vigilados.push(bloque);
  });
  if (!vigilados.length) return;

  // Orden real en la página, para elegir la última cuando dos tocan la franja a la vez.
  vigilados.sort(function (a, b) {
    return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });

  function idDe(elemento) {
    return elemento.getAttribute("data-espia") || elemento.id;
  }

  var enFranja = new Set();
  var activa = null;

  function marcar(id) {
    if (id === activa) return;
    activa = id;
    enlaces.forEach(function (enlace) {
      if (enlace.getAttribute("href") === "#" + id) {
        enlace.setAttribute("aria-current", "true");
      } else {
        enlace.removeAttribute("aria-current");
      }
    });
  }

  var observador = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          enFranja.add(entrada.target);
        } else {
          enFranja.delete(entrada.target);
        }
      });
      // Si ningún bloque toca la franja (por ejemplo, en el cierre final), se conserva la última activa.
      for (var i = vigilados.length - 1; i >= 0; i--) {
        if (enFranja.has(vigilados[i])) {
          marcar(idDe(vigilados[i]));
          return;
        }
      }
    },
    { rootMargin: "-35% 0px -60% 0px" }
  );

  vigilados.forEach(function (elemento) {
    observador.observe(elemento);
  });
})();
