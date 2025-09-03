# RoomieZ Platform

Una plataforma para encontrar y gestionar habitaciones compartidas.

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Instalación
1. Clona el repositorio:
```bash
git clone https://github.com/angel-iscoding/RommieZ.git
cd RommieZ
```

2. Instala las dependencias:
```bash
npm install
```

### Desarrollo Local
Para ejecutar el proyecto en modo desarrollo:
```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:3000`

### Construcción
Para construir el proyecto para producción:
```bash
npm run build
```

Para previsualizar la construcción:
```bash
npm run preview
```

## 🌐 Despliegue en Vercel

### Opción 1: Despliegue Automático
1. Conecta tu repositorio de GitHub a Vercel
2. Vercel detectará automáticamente que es un proyecto Vite
3. El despliegue se realizará automáticamente en cada push

### Opción 2: Despliegue Manual
1. Instala Vercel CLI:
```bash
npm i -g vercel
```

2. Construye el proyecto:
```bash
npm run build
```

3. Despliega:
```bash
vercel --prod
```

### Configuración de Vercel
El proyecto incluye un archivo `vercel.json` que configura:
- El directorio de construcción (`dist`)
- Las rutas para SPA (Single Page Application)
- El build command automático

## 📁 Estructura del Proyecto

```
RoomieZ-Platform/
├── index.html          # Página principal
├── index.js            # JavaScript principal
├── index.css           # Estilos principales
├── pages/              # Páginas adicionales
│   ├── config/         # Página de configuración
│   └── details/        # Página de detalles
├── scripts/            # Scripts de utilidad
│   ├── auth.js         # Autenticación
│   └── utils/          # Utilidades
├── vite.config.js      # Configuración de Vite
├── vercel.json         # Configuración de Vercel
└── package.json        # Dependencias y scripts
```

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Build Tool**: Vite
- **Deployment**: Vercel
- **Estilos**: CSS personalizado con fuentes Google Fonts

## 📝 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construcción para producción
- `npm run preview` - Previsualización de la construcción

## 🔧 Configuración de Vite

El proyecto está configurado con Vite para:
- Desarrollo rápido con Hot Module Replacement (HMR)
- Construcción optimizada para producción
- Soporte para módulos ES6
- Servidor de desarrollo con recarga automática

## 📱 Características

- Diseño responsive
- Autenticación de usuarios
- Búsqueda y filtrado de habitaciones
- Interfaz moderna y intuitiva
- Soporte para múltiples métodos de login

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.
