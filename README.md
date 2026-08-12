# 🎮 Nintendo Web Emulator

> Emulador web para ejecutar y organizar juegos clásicos de Nintendo directamente desde el navegador.

![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-In%20Development-orange)
![Platform](https://img.shields.io/badge/Platform-Web-blue)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20PC%20%7C%20Nintendo-blue)

## 🎮 Plataform Compatible

.gb → system: "gb"  
.gba → system: "gba"  
.nes → system: "nes"  
.sfc → system: "snes"

## 📖 Descripción

**Nintendo Web Emulator** es un proyecto web que permite organizar y ejecutar juegos de diferentes sistemas clásicos de Nintendo directamente desde el navegador.

El proyecto utiliza **EmulatorJS** para la emulación y una interfaz web personalizada para mostrar y organizar los juegos.

La información de los juegos se encuentra separada en `database/database.js`, mientras que los archivos principales de la interfaz se encuentran dentro de `includes/`.

Los juegos se colocan directamente en la raíz del proyecto, junto a `index.html`.

''📁 Estructura del proyecto

/
├── index.html
├── Secret of Mana (USA).sfc
│
├── includes/
│   ├── style.css
│   └── script.js
│
└── database/
    └── database.js

```bash
git clone https://github.com/xyvenqorix/nintendoEmu-js.git
cd nintendoEmu-js
