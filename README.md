# 📚 BookHunter – Guía para Publicar una App en GitHub Pages

## 🚀 Descripción

**BookHunter** es una aplicación desarrollada con **HTML, TailwindCSS, JavaScript y Vite**, que permite organizar y gestionar una colección personal de libros.
Esta guía explica paso a paso cómo **publicar el proyecto correctamente en GitHub Pages**, asegurando que los archivos estén en la raíz del repositorio (sin carpetas intermedias).

---

## 🧩 Estructura final del proyecto

Antes de subir tu proyecto, asegúrate de que los archivos principales se encuentren **directamente en la raíz** de tu carpeta local:

```
📁 bookhunterApp/
├── index.html
├── index.js
├── App.tsx
├── index.tsx
├── vite.config.ts
├── tsconfig.json
├── metadata.json
├── package.json
├── README.md
└── types.ts
```

> ❗ No debe existir una carpeta interna con el mismo nombre (`bookhunterApp/bookhunterApp/`).
> GitHub Pages solo publica los archivos que están **en la raíz** del repositorio.

---

## 🔧 Configuración de Git y conexión con GitHub

### 1️⃣ Inicializa Git (si no existe)

```bash
git init
git branch -M main
```

### 2️⃣ Conecta con tu repositorio remoto existente

```bash
git remote add origin https://github.com/TU_USUARIO/bookhunterApp.git
```

### 3️⃣ Añade y confirma tus archivos

```bash
git add .
git commit -m "Versión final lista para GitHub Pages"
```

### 4️⃣ Sube los cambios reemplazando el contenido anterior

> Usa `--force` solo si el repositorio ya tenía una versión antigua y quieres sobrescribirla.

```bash
git push -u origin main --force
```

---

## 🌐 Activar GitHub Pages

1. Ve a tu repositorio en GitHub → pestaña **Settings**
2. En el menú lateral, baja hasta **Pages**
3. En **Build and deployment**, selecciona:

   ```
   Source: Deploy from a branch
   Branch: main
   Folder: /(root)
   ```
4. Haz clic en **Save**

GitHub generará automáticamente tu sitio web en unos minutos.

### ✅ Tu aplicación quedará disponible en:

👉 `https://tuusuario.github.io/bookhunterApp/`

---

## ⚙️ Configuración del archivo `vite.config.ts`

Si tu proyecto utiliza **Vite**, asegúrate de tener esta línea para indicar la ruta de despliegue:

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/bookhunterApp/',
})
```

Esto asegura que las rutas y los recursos (CSS, JS, imágenes) se carguen correctamente al publicarse.

---

## 🧠 Errores comunes y soluciones

| Error                                 | Causa                                                | Solución                                               |
| ------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| La página no se ve o muestra 404      | Los archivos están dentro de una subcarpeta          | Mueve `index.html` y todos los archivos a la raíz      |
| GitHub Pages no aparece en Settings   | Estás viendo la configuración global, no la del repo | Asegúrate de estar en `/bookhunterApp/settings/pages`  |
| `fatal: remote origin already exists` | Ya tenías un repositorio conectado                   | Ejecuta `git remote remove origin` y vuelve a añadirlo |
| Los cambios no se actualizan          | No hiciste `commit` o `push` correctamente           | Usa `git status` para confirmar y vuelve a subir       |
| CSS o JS no cargan                    | Falta la propiedad `base` en `vite.config.ts`        | Añade `base: '/bookhunterApp/'`                        |

---

## 💡 Buenas prácticas

* Usa nombres de commits claros y cortos:

  ```bash
  git commit -m "Corrijo estilos del formulario"
  git commit -m "Agrego función de búsqueda"
  ```
* Evita carpetas duplicadas o anidadas dentro del repo.
* Verifica siempre en la pestaña **Code** de GitHub que el `index.html` está visible directamente al abrir el repositorio.
* Espera unos minutos después de cada `push` antes de probar tu URL pública.

---

## 📘 Referencia rápida – Comandos esenciales

```bash
# Crear el repositorio local
git init
git branch -M main

# Conectar con el remoto
git remote add origin https://github.com/TU_USUARIO/bookhunterApp.git

# Subir al repositorio
git add .
git commit -m "Versión final"
git push -u origin main --force

# Revisar estado
git status

# Actualizar cambios futuros
git add .
git commit -m "Actualizo proyecto"
git push
```

---

## ✨ Resultado final

Tu app **BookHunter** estará publicada en línea y accesible desde cualquier dispositivo.
Además, al tener los archivos en la raíz del repositorio, **GitHub Pages la servirá sin errores de ruta ni carpetas intermedias.**

