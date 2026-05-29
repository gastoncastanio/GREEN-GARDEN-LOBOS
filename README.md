# 🔥 El Quebracho — Lobos, Buenos Aires

Sitio web de **El Quebracho** — carbón y leña de quebracho puro, secado al sol del
campo bonaerense. Estética **rústico-premium**: como una marca de whisky artesanal
o un restaurante de campo de autor.

> _El quebracho no es solo carbón — es la tradición del asado argentino hecha producto._

## 📂 Estructura

```
/
├── index.html        · Home (9 secciones)
├── productos.html    · Catálogo completo con precios
├── envios.html       · Mapa interactivo de zonas de cobertura
├── mayorista.html    · Landing B2B para restaurantes y asadores
├── nosotros.html     · Historia de marca y valores
├── css/main.css      · Design system completo
├── js/main.js        · Menú mobile, partículas de fuego, scroll reveal, WhatsApp
└── img/              · Assets del proyecto (fotos reales)
```

## 🎨 Identidad visual

**Paleta**

| Token   | Hex       | Uso                      |
|---------|-----------|--------------------------|
| Carbón  | `#1a0e05` | Fondos oscuros           |
| Fuego   | `#F5C842` | Acentos / CTA            |
| Brasa   | `#C65B1A` | Detalles / hover         |
| Madera  | `#3D2B1F` | Texto sobre claro        |
| Humo    | `#F5EFE6` | Fondo base               |
| Campo   | `#2E5E30` | Zona Lobos / disponible  |

**Tipografía**
- **Display / Headings:** Playfair Display (carácter, elegancia rústica)
- **Body / UI:** DM Sans (legible, moderno, limpio)

## ⚙️ Contacto centralizado

Todo se gestiona desde `js/main.js` → objeto `QUEBRACHO`:
- **WhatsApp:** 11-2371-3598 (`5491123713598`)
- **Instagram:** [@elquebrachitolobos](https://instagram.com/elquebrachitolobos)

Los links de WhatsApp se generan con el atributo `data-wa="mensaje..."` en el HTML,
así el número vive en un solo lugar.

## 🚀 Uso

Sitio 100% estático. Servir cualquier carpeta con un server estático:

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## ✅ Próximos pasos

1. Subir **fotos reales** a `/img/` y reemplazar los emojis placeholder.
2. Conectar **dominio** sugerido: `elquebracho.com.ar`.
3. (Opcional) Métricas / pixel de Meta para campañas.

---

Hecho con 🔥 en Lobos, Buenos Aires.
