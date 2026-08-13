# Modelador

Visor 3D de propiedades. Cada casa es un archivo de datos; el motor sabe dibujar
cualquier cosa que cumpla el esquema.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + bundle a dist/
```

## Cómo está armado

```
src/
  model/       datos y cálculo — no importa three.js
    types.ts       esquema de Property / Level / Room / Furniture
    catalog.ts     muebles paramétricos (cama, barra, wc, sofá…)
    parts.ts       primitivas locales con las que se arma un mueble
    geometry.ts    áreas, medidas y encuadre, derivados del modelo
    palette.ts     todos los colores del proyecto
  properties/  una casa por archivo + el registro en index.ts
  scene/       motor: estructura, mobiliario, etiquetas, cámara
  ui/          controles, leyenda y ficha de cuarto
```

La regla que sostiene todo: **`properties/` es data pura y `scene/` es genérico.**
Agregar una casa no toca el motor, y cambiar el motor mejora todas las casas.

## Convenciones

- **Ejes**: `x` = frente, `z` = fondo, `y` = altura. Todo en metros.
- **Rectángulos**: `[x1, z1, x2, z2]`, siempre con `x1 < x2` y `z1 < z2`.
- **Muros**: un rectángulo por tramo; el espesor es su dimensión corta.
- **Cuartos**: a paño interior. Su área y sus medidas se calculan — nunca se
  escriben a mano, para que la leyenda no pueda contradecir al modelo.
- **Muebles**: el frente mira a `-z` cuando `rot = 0`; `rot` va en grados.
- **Ventanas** (`openings`): se dibujan encima del muro y `model/walls.ts` lo
  recorta en antepecho, panel opaco, vidrio y dintel. El espesor se hereda del
  muro, así que basta con que el rectángulo lo pise.
- **Muros bajos** no encoge la casa: corta la sección a 1.05 m, así se ve a qué
  altura arranca cada ventana.

## Editor de mobiliario

El botón **Editar** vuelve el mobiliario manipulable: click para seleccionar,
arrastrar para mover (se pega solo a los muros; con Shift, libre), `R` y
`Shift+R` para girar 90°, flechas para empujar 5 cm, `Supr` para borrar.

Lo editado vive en `localStorage`, no en el repo. **La fuente de verdad sigue
siendo el archivo de la propiedad**: "Exportar al archivo" genera el bloque
`furniture` con el formato del proyecto para pegarlo, y "Restaurar" tira la capa
local y vuelve a lo que dice el archivo.

## Agregar una propiedad

1. Copia `src/properties/tepoztlan.ts` — su encabezado es la guía de levantamiento.
2. Regístrala en `src/properties/index.ts`.

## Agregar un tipo de mueble

En `src/model/catalog.ts`: declara sus parámetros en `CatalogProps` y su builder
en `BUILDERS`. TypeScript obliga a que ambos existan y valida su uso en los
archivos de propiedades.

## Notas sobre las áreas de CDMX

Las cifras que muestra la app se calculan del modelo y no coinciden con las del
prototipo original, que estaban escritas a mano:

| Concepto | Prototipo | Calculado |
| --- | --- | --- |
| Interior | ≈ 84 m² | 76.9 m² |
| Terraza | ≈ 18 m² | 15.6 m² |
| Cuarto principal | 3.6 × 3.75 | 3.49 × 3.49 |

La diferencia de interior es esperable: lo calculado es superficie útil a paño
interior, sin contar el espesor de los muros. Las otras dos sugieren que el
levantamiento del croquis merece una revisión con flexómetro.
