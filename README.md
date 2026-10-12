
# Mi Billetera Vehicular - Proyecto Exportado

Este proyecto fue desarrollado originalmente en Firebase Studio. Aquí tienes los pasos para mantenerlo y subirlo a GitHub de forma limpia.

## 1. Limpiar el Historial de Commits (Opcional)
Si ves muchos commits con nombres extraños y quieres empezar de cero con un solo commit limpio, ejecuta esto en la terminal:

```bash
# Crear una rama temporal sin historial
git checkout --orphan rama-limpia

# Añadir todos los archivos
git add -A

# Crear tu nuevo commit con el nombre que quieras
git commit -m "Versión inicial limpia del proyecto"

# Borrar la rama principal vieja y renombrar la nueva
git branch -D main
git branch -m main
```

## 2. Cómo subir a GitHub (vía Terminal)

1. **Crea un repositorio nuevo en GitHub** (vacío, sin README ni .gitignore).
2. **Abre la Terminal** en Firebase Studio.
3. Ejecuta los siguientes comandos:

```bash
# Si no has inicializado git aún
git init

# Conectar con tu repositorio de GitHub
# Reemplaza <TU_USUARIO> y <TU_REPO>
git remote add origin https://github.com/<TU_USUARIO>/<TU_REPO>.git

# Subir el código
# NOTA: Usamos -f porque estamos reescribiendo la historia limpia
git push -u origin main -f
```
*Nota: El `-f` (force) es necesario si ya tenías historial y lo has limpiado con el paso 1.*

## Desarrollo Local
Una vez en tu PC:
1. `npm install`
2. Configura `.env` con tus credenciales de Firebase.
3. `npm run dev`
