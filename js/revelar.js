/*
 * Aparición en orden.
 * Los roles (IGL → Entry → AWPer → Support) y los pasos del proceso son secuencias:
 * al llegar a ellas, sus elementos aparecen uno tras otro para reforzar ese orden.
 * Se aplica solo a los hijos de los contenedores con data-revelar, y solo a los que
 * todavía están debajo de la pantalla al cargar (lo ya visible no parpadea).
 * Con "reducir movimiento" o sin IntersectionObserver no se hace nada: todo queda visible.
 */
(function () {
  "use strict";

  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var grupos = document.querySelectorAll("[data-revelar]");
  if (!grupos.length) return;

  var observador = new IntersectionObserver(
    function (entradas) {
      // Los que entran juntos (por ejemplo, una fila de pasos) se escalonan entre sí.
      var orden = 0;
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        var el = entrada.target;
        el.style.setProperty("--orden", String(Math.min(orden, 5)));
        el.classList.add("revelado");
        observador.unobserve(el);
        orden += 1;
      });
    },
    { rootMargin: "0px 0px -10% 0px" }
  );

  var altoPantalla = window.innerHeight;

  Array.prototype.forEach.call(grupos, function (grupo) {
    var hijos = Array.prototype.slice.call(grupo.children);
    // Primero se leen todas las posiciones y después se escriben las clases (sin reflujos repetidos).
    var posiciones = hijos.map(function (hijo) {
      return hijo.getBoundingClientRect().top;
    });
    hijos.forEach(function (hijo, i) {
      if (posiciones[i] < altoPantalla) return;
      hijo.classList.add("revelar");
      observador.observe(hijo);
    });
  });
})();
