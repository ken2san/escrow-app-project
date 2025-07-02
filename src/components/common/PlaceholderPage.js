import React from 'react';

const PlaceholderPage = ({ t, title, icon }) => (
    <div className="flex flex-col items-center justify-center h-full bg-white p-8 rounded-xl shadow-xl">
        <div className="text-indigo-300 mb-6">
            {React.cloneElement(icon, { size: 72, strokeWidth: 1.5 })}
        </div>
        <h2 className="text-3xl font-semibold text-gray-700 mb-3">{title}</h2>
        <p className="text-gray-500 max-w-md text-center">
            {t.pageUnderConstructionDetail.replace(
                '{placeholder}',
                title.toLowerCase()
            )}
        </p>
    </div>
);

export default PlaceholderPage;