import React from "react";
import { useNavigate } from 'react-router-dom';


const MentalModelsPage: React.FC = () => {
    const navigate = useNavigate();
    const categories = ["General thinking tools","Cognitive Biases","Economics","Systems", "Problem Solving"];

    return (
        <>
            <div className="min-h-screen flex flex-col justify-center items-center space-y-4">
                <h1 className="text-2xl font-bold">Mental Models</h1>
                {categories.map((category) => (
                    <button
                        key={category}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={() => navigate(`/mental/${category}`)}
                    >
                        {category}
                    </button>
                ))}
            </div>

        </>
    );
};

export default MentalModelsPage;