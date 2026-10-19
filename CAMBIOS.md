# Cambios para el portafolio

Resumen de lo que se cambió respecto a la versión entregada en clase y por qué. El diseño, los colores, las tipografías, los textos y el orden de las secciones se mantienen; los cambios corrigen errores y completan lo que faltaba.

## Bugs corregidos

- **El menú se cortaba en el celular.** En pantallas pequeñas los cinco enlaces pasaban a una segunda fila y "Inicio" quedaba cortado contra el borde izquierdo. La causa: `.header-contenido` declaraba `padding: 1rem 0`, y como el mismo elemento también tiene la clase `.contenedor`, ese `0` anulaba el margen lateral de 1.5rem. Ahora solo se fija el relleno vertical, y en móvil los enlaces viven en un menú desplegable (ver *Funcionalidades nuevas*). Efecto en escritorio: el logo y el menú se corren 24px hacia adentro y quedan alineados con el texto del hero.
- **Botones naranjas con texto blanco ilegible.** Blanco sobre `#f5a623` tiene un contraste de 2:1 y WCAG pide al menos 4.5:1. El texto de los botones principales y de los números del proceso pasó al negro de la página (`--color-fondo`), con un contraste de 9.6:1. Es el único cambio de color, y se hizo por accesibilidad.
- **Los círculos del proceso estaban vacíos.** El CSS de `.paso-numero` ya tenía estilos para mostrar un número, pero el HTML no lo tenía. Ahora un contador de CSS (`counter-reset` / `counter-increment`) numera los pasos del 1 al 6 automáticamente.
- **El efecto hover del botón final no funcionaba.** Los enlaces son elementos `inline` y `transform` no se aplica a ellos; con `display: inline-block` el botón "Vuelve al inicio" ya responde igual que los del hero.
- **Al saltar a una sección, sus primeros 73px quedaban detrás del header fijo.** Se añadió `scroll-padding-top` con el alto real del header (variable `--alto-header`), así cada sección empieza justo debajo de la cabecera. El header mide 73px en todos los tamaños de pantalla para que ese valor sea siempre correcto.
- **Hover "pegado" en pantallas táctiles.** Las elevaciones al pasar el mouse ahora solo se activan con un puntero real (`@media (hover: hover) and (pointer: fine)`).

## Funcionalidades nuevas (JavaScript)

Cada funcionalidad está en su propio archivo dentro de `js/`, cargado con `defer`. Todas son *mejora progresiva*: si JavaScript no carga, la página se ve completa.

- **Menú móvil (`menu.js`).** Botón con `aria-expanded` y `aria-controls`; el CSS muestra el panel leyendo ese mismo atributo, así el estado vive en un solo lugar. Se cierra con Escape (y el foco vuelve al botón), al tocar fuera, al elegir una sección, al salir del header con Tab y al agrandar la ventana. Sin JavaScript, el botón se oculta y los enlaces se muestran en una segunda fila (`@media (scripting: none)`).
- **Sección activa en el menú (`scrollspy.js`).** Un `IntersectionObserver` vigila una franja delgada a la altura del 35–40% de la pantalla; la sección que la cruza marca su enlace con `aria-current="true"`. No escucha el evento `scroll`, por lo que no afecta el rendimiento. Se usa `aria-current="true"` y no `"page"` porque los enlaces apuntan a secciones de la misma página.
- **Terminal que se escribe (`terminal.js`).** Cuando la consola entra en pantalla, los comandos se escriben letra por letra y la última línea aparece de golpe, como la salida de un programa. Las líneas pendientes conservan su espacio (`visibility: hidden`) para que la consola no cambie de alto. Para lectores de pantalla se crea una copia invisible con el texto completo y la versión animada se marca `aria-hidden`.
- **Filtros del arsenal (`arsenal.js`).** Botones *Todo / Armas / Utilidad* con `aria-pressed` y contador de elementos; los elementos que quedan entran con una animación corta (Web Animations API) que se cancela si cambias de filtro rápido. Un texto con `aria-live` anuncia "Se muestran 3 de 6 elementos: armas.". La categoría sale del propio contenido (AK-47, AWP y Deagle son armas; Flashbang, Smoke y Molotov, granadas), igual que en el menú de compra del juego.
- **Aparición en orden (`revelar.js`).** Solo en las dos secuencias de la página: roles y pasos del proceso. Los elementos que entran juntos se escalonan 70ms entre sí. Lo que ya está visible al cargar no se anima, para que nada parpadee.

## Accesibilidad

- Enlace **"Saltar al contenido"** que aparece con la primera pulsación de Tab y lleva a `<main id="contenido">`.
- **Foco visible** en todos los enlaces y botones, con el color de la marca.
- **Movimiento reducido:** si el sistema lo pide, no hay scroll suave, ni aparición, ni escritura animada, ni parpadeo del cursor; solo quedan los cambios de color que indican estado.
- **HTML más semántico:** el proceso es una lista ordenada (`<ol>`), el arsenal una lista (`<ul>`), las flechas decorativas entre roles y el cursor tienen `aria-hidden`, y los dos menús tienen `aria-label` distintos ("Secciones" y "Secciones (pie de página)").
- **Textos alternativos descriptivos** en el hero y en los iconos de estrategia. El logo y las imágenes del arsenal usan `alt=""` porque el nombre ya está escrito al lado; así el lector de pantalla no lo repite.
- **Objetivos táctiles de 44px o más** en móvil: botón del menú, enlaces del panel (48px), filtros, enlaces del pie y el logo.
- Selección de texto y barra de desplazamiento con los colores del sitio (`::selection`, `scrollbar-color`, `color-scheme: dark`).

## Rendimiento

- **Imágenes a WebP** con `sharp`, redimensionadas al doble del tamaño en que se muestran. El peso total de imágenes bajó de unos **2.1 MB a 112 KB**. Ejemplos: `lectura.png` 269 KB → `lectura.webp` 3.6 KB (se muestra a 48px); `logo.png` 170 KB → `logo.webp` 2.7 KB. El hero se guardó sin pérdida porque es un gráfico de colores planos y así pesa menos (5 KB) que con pérdida.
- **Imágenes sin usar eliminadas:** `dinero.png` (761 KB) e `info.png` no aparecían en ninguna parte.
- Todas las imágenes tienen `width` y `height` (evitan saltos de diseño mientras cargan); las que están debajo de la primera pantalla usan `loading="lazy"` y `decoding="async"`, y la del hero `fetchpriority="high"`.
- Las imágenes del arsenal pasaron de `background-image` en estilos en línea a etiquetas `<img>` reales: ahora cargan solo cuando hacen falta y el degradado oscuro vive en el CSS (`::after`).
- La página completa pasó de **1207 KB a unos 80 KB** de archivos locales.

## Contenido

- `<meta name="description">`, Open Graph (`og:title`, `og:description`, `og:type`, `og:locale`, `og:site_name`), `theme-color` y favicon (`favicon-32.png` y `apple-touch-icon.png`, generados a partir del logo).
- **Pie de página completo:** descripción del proyecto, enlaces a las secciones, créditos de las imágenes y la línea académica original.
- Títulos con `text-wrap: balance` para no dejar una palabra sola en la última línea, y "post-partida" ya no se parte en dos renglones.
- `README.md` con capturas, funcionalidades, estructura y créditos.

## Seguridad para publicar

- `netlify.toml` con cabeceras de seguridad: política de contenido (`Content-Security-Policy`) que solo permite los recursos que el sitio usa, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` y HTTPS obligatorio. Se probó en Chromium con esas cabeceras: todas las páginas cargan sin violaciones y pasan las mismas pruebas de antes.
- Caché del navegador: 30 días para imágenes y 1 hora para CSS y JS, para que quien vuelve no descargue todo otra vez.
- `.gitignore` para no subir por error archivos `.env`, la carpeta `.netlify/`, `node_modules/` ni archivos del editor o del sistema.
