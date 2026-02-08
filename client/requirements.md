## Packages
recharts | For data visualization charts (demand trends)
leaflet | Core mapping library
react-leaflet | React components for Leaflet maps
d3-scale | For generating color scales for the heatmap
d3-interpolate | For smooth color interpolation
date-fns | For robust date and time manipulation
framer-motion | For smooth UI transitions and animations

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
  mono: ["var(--font-mono)"],
}

Leaflet requires CSS import in index.css.
The map assumes the API returns valid GeoJSON in the `geometry` field of the zones table.
Chat integration uses SSE (Server-Sent Events) at POST /api/conversations/:id/messages.
