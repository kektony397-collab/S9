import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { TrackingSession } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import React from 'react';
import ReactDOM from 'react-dom/client';

// FIX: Removed invalid 'jspdf' module augmentation. Type casting will be used for autoTable calls.
// The augmentation was removed because TypeScript could not find the 'jspdf' module,
// likely due to a missing type definition dependency.

// Chart Component to be rendered off-screen
// FIX: Rewrote SpeedChart using React.createElement to avoid JSX in a .ts file.
const SpeedChart = ({ data }: { data: any[] }) => (
    React.createElement('div', { style: { width: '800px', height: '400px', background: 'white', padding: '1rem' } },
        // FIX: Pass LineChart as an explicit 'children' prop to fix typing issue with ResponsiveContainer.
        React.createElement(ResponsiveContainer, {
            children: React.createElement(LineChart, { data: data },
                React.createElement(CartesianGrid, { strokeDasharray: "3 3" }),
                React.createElement(XAxis, { dataKey: "time", label: { value: 'Time (minutes)', position: 'insideBottom', offset: -5 } }),
                React.createElement(YAxis, { label: { value: 'Speed (km/h)', angle: -90, position: 'insideLeft' } }),
                React.createElement(Tooltip, {}),
                // FIX: Cast Legend to 'any' to bypass a type error with its 'defaultProps'.
                React.createElement(Legend as any, { verticalAlign: "top", height: 36 }),
                React.createElement(Line, { type: "monotone", dataKey: "speed", stroke: "#8884d8", activeDot: { r: 8 }, name: "Speed" })
            )
        })
    )
);


async function renderAndCaptureChart(session: TrackingSession): Promise<string | null> {
    const chartData = session.locationHistory.map((p, index) => ({
        time: (p.timestamp - session.startTime) / 60000, // minutes
        speed: p.speed || 0,
    }));
    
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(SpeedChart, { data: chartData }));

    // Wait a bit for chart to render
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        const canvas = await html2canvas(container.firstChild as HTMLElement);
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error("Error capturing chart:", error);
        return null;
    } finally {
        root.unmount();
        document.body.removeChild(container);
    }
}


export const generatePdf = async (session: TrackingSession) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(22);
    doc.text('GPS Tracking Session Report', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text(session.name, 105, 30, { align: 'center' });

    // Summary
    doc.setFontSize(12);
    doc.text('Summary', 14, 45);
    // FIX: Cast 'doc' to 'any' to use the 'autoTable' plugin method.
    (doc as any).autoTable({
        startY: 50,
        head: [['Metric', 'Value']],
        body: [
            ['Start Time', new Date(session.startTime).toLocaleString()],
            ['End Time', new Date(session.endTime).toLocaleString()],
            ['Total Distance', `${session.stats.distance.toFixed(2)} km`],
            ['Average Speed', `${session.stats.avgSpeed.toFixed(2)} km/h`],
            ['Max Speed', `${session.stats.maxSpeed.toFixed(2)} km/h`],
            ['Area Covered', `${session.stats.area.toFixed(2)} m²`],
        ],
        theme: 'grid',
    });

    // FIX: Cast 'doc' to 'any' to access 'lastAutoTable' from the plugin.
    const finalYAfterSummary = (doc as any).lastAutoTable.finalY || 80;

    // Map Screenshot
    const mapElement = document.getElementById('map-container');
    if (mapElement) {
        try {
            const canvas = await html2canvas(mapElement, { useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            doc.addPage();
            doc.text('Track Path', 105, 20, { align: 'center' });
            doc.addImage(imgData, 'PNG', 15, 30, 180, 100);
        } catch (error) {
            console.error("Error capturing map:", error);
            doc.addPage();
            doc.text('Could not capture map image.', 15, 30);
        }
    }
    
    // Speed Chart
    const chartImgData = await renderAndCaptureChart(session);
    if(chartImgData) {
        doc.addPage();
        doc.text('Speed Over Time', 105, 20, { align: 'center' });
        doc.addImage(chartImgData, 'PNG', 15, 30, 180, 90);
    }


    // Data Table
    doc.addPage();
    doc.text('Detailed Log', 14, 20);
    const tableData = session.locationHistory.map((p, index) => [
        index + 1,
        new Date(p.timestamp).toLocaleTimeString(),
        p.lat.toFixed(6),
        p.lng.toFixed(6),
        p.speed?.toFixed(2) || 'N/A',
    ]);

    // FIX: Cast 'doc' to 'any' to use the 'autoTable' plugin method.
    (doc as any).autoTable({
        startY: 30,
        head: [['#', 'Time', 'Latitude', 'Longitude', 'Speed (km/h)']],
        body: tableData,
        theme: 'striped',
    });

    doc.save(`${session.name.replace(/\s+/g, '_')}_Report.pdf`);
};