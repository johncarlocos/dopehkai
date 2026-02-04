import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

interface GlobeAnimationProps {
    className?: string;
    style?: React.CSSProperties;
    width?: number | string;
    height?: number | string;
}

export default function GlobeAnimation({ 
    className = "", 
    style,
    width = 800,
    height = 800 
}: GlobeAnimationProps) {
    const [animationData, setAnimationData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load the Lottie animation JSON
        fetch('https://cdn.prod.website-files.com/67b873ab284925c72f7f5176/67bbbd8ade2275798af595f6_63473c637f3d3f5530d4c44c_lf30_editor_meaiixa3.json')
            .then(response => response.json())
            .then(data => {
                setAnimationData(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading Lottie animation:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return null; // Show nothing while loading
    }

    if (!animationData) {
        console.warn('GlobeAnimation: Failed to load animation data');
        return null;
    }

    return (
        <div 
            className={`globe-lottie ${className}`}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                filter: 'brightness(0) invert(1)', // Convert to white
                ...style
            }}
        >
            <Lottie
                animationData={animationData}
                loop={true}
                autoplay={true}
                style={{
                    width: '100%',
                    height: '100%'
                }}
            />
        </div>
    );
}

