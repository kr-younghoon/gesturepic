'use client';

import { useState } from 'react';
import HandGesture from '../components/HandGesture';

export default function Home() {
  const [activeCamera, setActiveCamera] = useState(1);

  const renderCameraBox = (id) => (
    <div 
      className={`bg-black relative flex items-center justify-center cursor-pointer ${
        activeCamera === id ? 'ring-4 ring-blue-500' : ''
      }`}
      onClick={() => setActiveCamera(id)}
    >
      {activeCamera === id ? (
        <HandGesture id={String(id)} />
      ) : (
        <div className="text-white">Click to activate camera {id}</div>
      )}
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="grid grid-cols-2 grid-rows-2 gap-4 w-[800px] h-[800px]">
        {renderCameraBox(1)}
        {renderCameraBox(2)}
        {renderCameraBox(3)}
        {renderCameraBox(4)}
      </div>
    </div>
  );
}
