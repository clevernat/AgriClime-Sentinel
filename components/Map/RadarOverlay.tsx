"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

interface RadarOverlayProps {
  map: L.Map | null;
  enabled: boolean;
  opacity?: number;
}

/**
 * NEXRAD Radar Overlay Component
 * 
 * Displays real-time NEXRAD radar imagery from Iowa State Mesonet
 * on the Leaflet map.
 * 
 * Data Source: Iowa State University Environmental Mesonet
 * API: https://mesonet.agron.iastate.edu/GIS/radmap.php
 */
export default function RadarOverlay({
  map,
  enabled,
  opacity = 0.6,
}: RadarOverlayProps) {
  const radarLayerRef = useRef<L.ImageOverlay | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!map) return;

    const updateRadar = () => {
      // Remove existing radar layer
      if (radarLayerRef.current) {
        map.removeLayer(radarLayerRef.current);
        radarLayerRef.current = null;
      }

      if (!enabled) return;

      // CONUS bounds for radar imagery
      const bounds: L.LatLngBoundsExpression = [
        [24.0, -126.0], // Southwest corner
        [50.0, -66.0],  // Northeast corner
      ];

      // Generate timestamp for cache busting (updates every 5 minutes)
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(Math.floor(now.getMinutes() / 5) * 5).padStart(2, '0')}`;

      // Iowa State Mesonet RadMap API
      // Layers: nexrad (CONUS composite), legend
      const radarUrl = `https://mesonet.agron.iastate.edu/GIS/radmap.php?layers[]=nexrad&sector=conus&width=2400&height=1600&ts=${timestamp}`;

      // Create image overlay
      radarLayerRef.current = L.imageOverlay(radarUrl, bounds, {
        opacity: opacity,
        interactive: false,
        className: 'radar-overlay',
      });

      radarLayerRef.current.addTo(map);
    };

    // Initial update
    updateRadar();

    // Auto-update every 5 minutes (NEXRAD updates every 5-10 minutes)
    if (enabled) {
      updateIntervalRef.current = setInterval(updateRadar, 5 * 60 * 1000);
    }

    return () => {
      // Cleanup
      if (radarLayerRef.current) {
        map.removeLayer(radarLayerRef.current);
        radarLayerRef.current = null;
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [map, enabled, opacity]);

  return null; // This component doesn't render anything directly
}

