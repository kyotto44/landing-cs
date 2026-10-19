/*
 * Filtros del arsenal.
 * Igual que el menú de compra del juego separa armas y granadas, los botones
 * "Todo / Armas / Utilidad" muestran solo los elementos de esa categoría
 * (atributo data-categoria de cada <li>). Cada botón es un interruptor con
 * aria-pressed, y un texto invisible con aria-live anuncia cuántos elementos quedan.
 * Sin JavaScript, el grupo de filtros sigue oculto (hidden) y se ve todo el arsenal.
 */
(function () {
  "use strict";

  var filtros = document.querySelector(".filtros");
  var lista = document.querySelector(".tecnologias");
  if (!filtros || !lista) return;

  var botones = Array.prototype.slice.call(filtros.querySelectorAll("[data-filtro]"));
  var elementos = Array.prototype.slice.call(lista.querySelectorAll("[data-categoria]"));
  var estado = document.querySelector("[data-filtro-estado]");
  var reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!botones.length || !elementos.length) return;

  var NOMBRES = { todo: "todo el arsenal", arma: "armas", utilidad: "utilidad" };
  var filtroActual = "todo";

  function cantidadDe(categoria) {
    if (categoria === "todo") return elementos.length;
    return elementos.filter(function (el) {
      return el.getAttribute("data-categoria") === categoria;
    }).length;
  }

  // Contador junto a cada botón ("Armas 3").
  Array.prototype.forEach.call(filtros.querySelectorAll("[data-cantidad]"), function (span) {
    span.textContent = String(cantidadDe(span.getAttribute("data-cantidad")));
  });

  // Animaciones en curso de cada elemento, para cancelarlas si se cambia de filtro muy rápido.
  var animaciones = new Map();

  // Entrada breve de los elementos que quedan visibles: subir 8px y aparecer, en cascada.
  function animarEntrada(visibles) {
    if (reducirMovimiento.matches || typeof Element.prototype.animate !== "function") return;
    visibles.forEach(function (el, orden) {
      var animacion = el.animate(
        [
          { opacity: 0, transform: "translateY(8px) scale(0.98)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: 260,
          delay: orden * 40,
          easing: "cubic-bezier(0.23, 1, 0.32, 1)",
          fill: "backwards",
        }
      );
      animaciones.set(el, animacion);
    });
  }

  function aplicar(categoria) {
    if (categoria === filtroActual) return;
    filtroActual = categoria;

    botones.forEach(function (boton) {
      boton.setAttribute("aria-pressed", String(boton.getAttribute("data-filtro") === categoria));
    });

    var visibles = [];
    elementos.forEach(function (el) {
      // Si había una animación en curso (clics rápidos), se cancela para no encadenarlas.
      var anterior = animaciones.get(el);
      if (anterior) {
        anterior.cancel();
        animaciones.delete(el);
      }
      var mostrar = categoria === "todo" || el.getAttribute("data-categoria") === categoria;
      el.hidden = !mostrar;
      if (mostrar) visibles.push(el);
    });

    animarEntrada(visibles);

    if (estado) {
      estado.textContent =
        "Se muestran " + visibles.length + " de " + elementos.length + " elementos: " + NOMBRES[categoria] + ".";
    }
  }

  botones.forEach(function (boton) {
    boton.addEventListener("click", function () {
      aplicar(boton.getAttribute("data-filtro"));
    });
  });

  filtros.hidden = false;
})();
