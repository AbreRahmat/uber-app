import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Leaflet's default marker images break under Vite unless set explicitly
const defaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [ 25, 41 ],
    iconAnchor: [ 12, 41 ]
})

const center = { lat: 28.6139, lng: 77.2090 } // Delhi, used until GPS responds

// Moves the map whenever the position changes
const Recenter = ({ position }) => {
    const map = useMap()
    useEffect(() => {
        map.setView([ position.lat, position.lng ])
    }, [ position, map ])
    return null
}

const LiveTracking = () => {
    const [ currentPosition, setCurrentPosition ] = useState(center)

    useEffect(() => {
        if (!navigator.geolocation) return

        const onPosition = (position) => {
            const { latitude, longitude } = position.coords
            setCurrentPosition({ lat: latitude, lng: longitude })
        }

        navigator.geolocation.getCurrentPosition(onPosition, (err) => console.warn(err.message))
        const watchId = navigator.geolocation.watchPosition(onPosition, (err) => console.warn(err.message))

        return () => navigator.geolocation.clearWatch(watchId)
    }, [])

    return (
        <MapContainer
            center={[ currentPosition.lat, currentPosition.lng ]}
            zoom={15}
            style={{ width: '100%', height: '100%' }}
        >
            <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={[ currentPosition.lat, currentPosition.lng ]} icon={defaultIcon} />
            <Recenter position={currentPosition} />
        </MapContainer>
    )
}

export default LiveTracking
