/*
 * Menú móvil.
 * En pantallas de 768px o menos, los cinco enlaces del header no caben en una fila,
 * así que se esconden en un panel que abre el botón .menu-boton.
 * El estado vive en un solo lugar: el atributo aria-expanded del botón.
 * El CSS (responsive.css) muestra el panel con el selector
 * .menu-boton[aria-expanded="true"] + .menu, y los lectores de pantalla
 * anuncian "expandido / contraído" con ese mismo atributo.
 */
(function () {
  "use strict";

  var boton = document.querySelector(".menu-boton");
  var menu = document.getElementById("menu-principal");
  if (!boton || !menu) return;

  var header = boton.closest("header") || document.body;
  var pantallaMovil = window.matchMedia("(max-width: 768px)");

  function estaAbierto() {
    return boton.getAttribute("aria-expanded") === "true";
  }

  function abrir() {
    boton.setAttribute("aria-expanded", "true");
  }

  // devolverFoco: true cuando se cierra con Escape, para que el teclado no se pierda.
  function cerrar(devolverFoco) {
    if (!estaAbierto()) return;
    boton.setAttribute("aria-expanded", "false");
    if (devolverFoco) boton.focus();
  }

  boton.addEventListener("click", function () {
    if (estaAbierto()) {
      cerrar(false);
    } else {
      abrir();
    }
  });

  // Elegir una sección cierra el panel; el desplazamiento suave sigue su curso.
  menu.addEventListener("click", function (evento) {
    if (evento.target.closest("a")) cerrar(false);
  });

  // Escape cierra el panel y devuelve el foco al botón.
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && estaAbierto()) {
      cerrar(true);
    }
  });

  // Tocar o hacer clic fuera del header también lo cierra.
  document.addEventListener("pointerdown", function (evento) {
    if (estaAbierto() && !header.contains(evento.target)) {
      cerrar(false);
    }
  });

  // Si el foco sale del header con Tab, el panel no debe quedar abierto tapando el contenido.
  header.addEventListener("focusout", function (evento) {
    var destino = evento.relatedTarget;
    if (estaAbierto() && destino && !header.contains(destino)) {
      cerrar(false);
    }
  });

  // Al pasar a una pantalla ancha el panel deja de existir: se restablece el estado.
  function alCambiarPantalla(consulta) {
    if (!consulta.matches) cerrar(false);
  }

  if (typeof pantallaMovil.addEventListener === "function") {
    pantallaMovil.addEventListener("change", alCambiarPantalla);
  } else if (typeof pantallaMovil.addListener === "function") {
    pantallaMovil.addListener(alCambiarPantalla);
  }
})();
