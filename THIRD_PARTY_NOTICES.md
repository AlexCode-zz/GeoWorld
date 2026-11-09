# Avisos de terceros

GeoWorld usa material de terceros para las imágenes del planeta, la tipografía y
el propio stack. Este archivo reúne los créditos y las licencias aplicables.

## Texturas de la Tierra (`public/textures`)

Las tres imágenes base provienen de **NASA Visible Earth** y son material de
**dominio público** de la NASA: se pueden usar, modificar y redistribuir sin
pedir permiso. La NASA no patrocina ni respalda este proyecto.

| Archivo               | Origen                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `earth-day.jpg`       | [Blue Marble Next Generation, julio de 2004](https://visibleearth.nasa.gov/images/57730/the-blue-marble-land-surface-ocean-color-and-sea-ice) (NASA Earth Observatory) |
| `earth-clouds.png`    | [Cloud Combined, julio de 2004](https://visibleearth.nasa.gov/images/57747/cloud-combined) (NASA Earth Observatory)                                            |
| `earth-night.png`     | [Earth's City Lights](https://visibleearth.nasa.gov/images/55167/earths-city-lights) (DMSP, NASA/NOAA)                                                         |

A partir del mapa diurno se generaron dos mapas derivados, también libres de
restricciones:

- `earth-normal.jpg` — relieve calculado a partir de la luminancia del mapa
  diurno (Sobel suavizado, océanos y hielo aplanados).
- `earth-specular.jpg` — máscara de océanos y hielo calculada a partir del color
  del mapa diurno.

Los ajustes aplicados son de color y contraste (tono, recorte de luces
nocturnas, curva alfa de las nubes) y no alteran la licencia del material
original. Crédito recomendado: *Imágenes de la Tierra: NASA Visible Earth*.

## Tipografía

**Geist** y **Geist Mono** se cargan con `next/font`.

Copyright (c) 2023 Vercel, in collaboration with basement.studio

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL

---

SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION AND CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

---

## Bibliotecas

Las dependencias se instalan con npm y conservan sus propios archivos de
licencia dentro de `node_modules`.

| Paquete                                   | Licencia |
| ----------------------------------------- | -------- |
| `three` (@types/three)                    | MIT      |
| `next`, `react`, `react-dom`              | MIT      |
| `@react-three/fiber`, `@react-three/drei` | MIT      |
| `framer-motion`                           | MIT      |
| `tailwindcss`, `@tailwindcss/turbopack`   | MIT      |
| `typescript`, `@types/*`                  | Apache-2.0 / MIT |

**three.js** — Copyright © 2010-2026 three.js authors. Licencia MIT.

**sharp** (solo en desarrollo, no forma parte del sitio publicado) — Apache-2.0;
su dependencia nativa **libvips** es LGPL-3.0-or-later, usada como biblioteca
dinámica sin modificaciones.

**caniuse-lite** (dependencia transitiva de Next.js) — CC BY 4.0, datos de
<https://caniuse.com>.

## Nota

Este archivo no constituye asesoramiento legal. Si añades recursos nuevos
(imágenes, iconos, fuentes o sonidos), revisa su licencia y añade aquí su
crédito correspondiente.
