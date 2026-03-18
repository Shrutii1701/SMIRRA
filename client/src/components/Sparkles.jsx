import { useState, useEffect } from 'react';
import './Sparkles.css';

export default function Sparkles() {
    const [sparkles, setSparkles] = useState([]);

    useEffect(() => {
        let timeout;
        
        const handleMouseMove = (e) => {
            const newSparkle = {
                id: Date.now() + Math.random(),
                x: e.clientX,
                y: e.clientY,
                color: Math.random() > 0.5 ? 'var(--accent-primary)' : 'var(--accent-secondary)'
            };
            
            setSparkles(prev => [...prev.slice(-20), newSparkle]); // Keep max 20 sparkles

            // Clear old sparkles after they fade
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                setSparkles(prev => prev.filter(s => Date.now() - s.id < 500));
            }, 600); // slightly longer than animation
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div className="sparkles-container">
            {sparkles.map(sparkle => (
                <div
                    key={sparkle.id}
                    className="sparkle"
                    style={{
                        left: sparkle.x,
                        top: sparkle.y,
                        backgroundColor: sparkle.color,
                        boxShadow: `0 0 8px ${sparkle.color}`
                    }}
                />
            ))}
        </div>
    );
}
