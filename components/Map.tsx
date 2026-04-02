"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { PlaceCard } from "@/lib/types";

// Fix Leaflet default icon in Next.js
const icon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const activeIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

interface SingleMapProps {
  lat: number;
  lng: number;
  name: string;
  address: string;
  zoom?: number;
}

export function SinglePlaceMap({ lat, lng, name, address, zoom = 15 }: SingleMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      style={{ height: "300px", width: "100%" }}
      className="rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={activeIcon}>
        <Popup>
          <div className="p-1">
            <p className="font-bold text-sm">{name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{address}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}

interface MultiMapProps {
  places: PlaceCard[];
  center?: [number, number];
  zoom?: number;
  activePlaceId?: string;
}

export function MultiPlaceMap({ places, center, zoom = 12, activePlaceId }: MultiMapProps) {
  const defaultCenter: [number, number] = center ??
    (places.length > 0 ? [places[0].lat, places[0].lng] : [51.505, -0.09]);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={place.id === activePlaceId ? activeIcon : icon}
        >
          <Popup>
            <div className="p-1 min-w-[160px]">
              <p className="font-bold text-sm">{place.name}</p>
              <p className="text-xs text-gray-500">{place.city}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-amber-500 text-xs">★</span>
                <span className="text-xs font-semibold">{place.avgRating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({place.reviewCount})</span>
              </div>
              <Link href={`/places/${place.id}`} className="text-xs text-turquoise-600 font-semibold mt-1 block hover:underline">
                View details →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
