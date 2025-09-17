import React, { useState } from 'react';
import { buildingsService } from '../../services/buildingsService';

const BuildingsAPIDebugger = () => {
  const [buildingsResult, setBuildingsResult] = useState(null);
  const [buildingResult, setBuildingResult] = useState(null);
  const [roomsResult, setRoomsResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const testBuildingsAPI = async () => {
    setTesting(true);
    console.log('Testing Buildings API...');
    
    try {
      // Test 1: Get all buildings
      console.log('1. Testing GET /api/buildings/');
      const buildingsResponse = await buildingsService.getBuildings();
      console.log('Buildings response:', buildingsResponse);
      setBuildingsResult(buildingsResponse);

      if (buildingsResponse.success && buildingsResponse.data.results?.length > 0) {
        const firstBuilding = buildingsResponse.data.results[0];
        
        // Test 2: Get specific building details
        console.log(`2. Testing GET /api/buildings/${firstBuilding.id}/`);
        const buildingResponse = await buildingsService.getBuilding(firstBuilding.id);
        console.log('Building details response:', buildingResponse);
        setBuildingResult(buildingResponse);

        // Test 3: Get rooms in building
        console.log(`3. Testing GET /api/buildings/${firstBuilding.id}/rooms/`);
        const roomsResponse = await buildingsService.getRoomsInBuilding(firstBuilding.id);
        console.log('Rooms response:', roomsResponse);
        setRoomsResult(roomsResponse);
      }

    } catch (error) {
      console.error('Buildings API test failed:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Buildings API Debugger</h2>
      
      <button
        onClick={testBuildingsAPI}
        disabled={testing}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {testing ? 'Testing...' : 'Test Buildings API'}
      </button>

      {/* Buildings List Result */}
      {buildingsResult && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">1. Buildings List</h3>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Success:</strong> {buildingsResult.success ? 'Yes' : 'No'}</p>
            {buildingsResult.success ? (
              <div>
                <p><strong>Count:</strong> {buildingsResult.data.count}</p>
                <p><strong>Buildings:</strong></p>
                <ul className="ml-4">
                  {buildingsResult.data.results?.map(building => (
                    <li key={building.id} className="text-sm">
                      {building.id}: {building.name} ({building.total_rooms} rooms, {building.occupancy_rate.toFixed(1)}% occupied)
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-red-600"><strong>Error:</strong> {buildingsResult.error}</p>
            )}
          </div>
        </div>
      )}

      {/* Building Details Result */}
      {buildingResult && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">2. Building Details</h3>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Success:</strong> {buildingResult.success ? 'Yes' : 'No'}</p>
            {buildingResult.success ? (
              <div>
                <p><strong>Name:</strong> {buildingResult.data.name}</p>
                <p><strong>Location:</strong> {buildingResult.data.location}</p>
                <p><strong>Total Rooms:</strong> {buildingResult.data.total_rooms}</p>
                <p><strong>Available Rooms:</strong> {buildingResult.data.available_rooms}</p>
                <p><strong>Total Capacity:</strong> {buildingResult.data.total_capacity}</p>
                <p><strong>Occupancy Rate:</strong> {buildingResult.data.occupancy_rate.toFixed(1)}%</p>
              </div>
            ) : (
              <p className="text-red-600"><strong>Error:</strong> {buildingResult.error}</p>
            )}
          </div>
        </div>
      )}

      {/* Rooms List Result */}
      {roomsResult && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">3. Rooms in Building</h3>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Success:</strong> {roomsResult.success ? 'Yes' : 'No'}</p>
            {roomsResult.success ? (
              <div>
                <p><strong>Count:</strong> {roomsResult.data.count}</p>
                <p><strong>Rooms:</strong></p>
                <ul className="ml-4">
                  {roomsResult.data.results?.slice(0, 5).map(room => (
                    <li key={room.id} className="text-sm">
                      Room {room.room_number}: {room.capacity} beds, 
                      {room.has_toilet ? ' Private Toilet,' : ''}
                      {room.has_washroom ? ' Private Washroom,' : ''}
                      {room.is_available ? ' Available' : ' Occupied'}
                    </li>
                  ))}
                  {roomsResult.data.results?.length > 5 && (
                    <li className="text-sm text-gray-600">... and {roomsResult.data.results.length - 5} more rooms</li>
                  )}
                </ul>
              </div>
            ) : (
              <p className="text-red-600"><strong>Error:</strong> {roomsResult.error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingsAPIDebugger;
