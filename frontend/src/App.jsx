import { useState } from 'react'
import { Routes } from 'react-router-dom';

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/idea" element={<Idea />} />
            </Routes>
        </>
    )
}

export default App;
