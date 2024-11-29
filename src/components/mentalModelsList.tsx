import {useState} from "react";
import { useNavigate, useParams } from "react-router-dom";


const mentalModels = {
    "General thinking tools": [
        { name: "Inversion", details: "todo" },
        { name: "The map is not the territory", details: "todo" },
        { name: "Circle of competence", details: "\"I'm no genius. I'm smart in sports - but i stay around those spots.\"" },
        { name: "First Principles Thinking", details: "todo" },
        { name: "Second Order Thinking", details: "todo" },
        { name: "Thought experiment", details: "todo" },
        { name: "Probabilistic thinking", details: "todo" },
        { name: "Occam's Razor", details: "todo" },
        { name: "Hanlon's Razor", details: "todo" },
    ],

    "Cognitive Biases": [
        { name: "Anchoring Bias", details: "The tendency to rely too heavily on the first piece of information." },
        { name: "Confirmation Bias", details: "The tendency to search for information that confirms pre-existing beliefs." },
    ],
    "Problem Solving": [
        { name: "First Principles Thinking", details: "Breaking down problems to their basic components." },
        { name: "Lateral Thinking", details: "Solving problems through an indirect and creative approach." },
    ],
};

const MentalModelsList = () => {
    const [expandedModel, setExpandedModel] = useState<string | null>(null);

    const { category } = useParams();

    // @ts-ignore
    const models = mentalModels?.[category] || [];

    const navigate = useNavigate();

    if (!category) {
        // Handle the case where 'category' is undefined
        return <div>Category not found</div>;
    } else {
        return (
                <div className="min-h-screen flex flex-col justify-center items-center space-y-4">
                    <h2 className="text-lg font-bold text-gray-800">{category}</h2>
                    <div className="flex items-center">
                        <button
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                            onClick={() => navigate(-1)} // Goes back in browser history
                        >
                            Back
                        </button>
                    </div>
                    <div className="w-full max-w-md space-y-4">
                        {// @ts-ignore
                            models.map((model) => (
                            <div key={model.name} className="bg-gray-100 p-4 rounded shadow">
                                <button
                                    className="w-full text-center text-blue-500 font-bold hover:underline"
                                    onClick={() =>
                                        setExpandedModel((prev) => (prev === model.name ? null : model.name))
                                    }
                                >
                                    {model.name}
                                </button>

                                {/* Details Section */}
                                {expandedModel === model.name && (
                                    <div className="mt-2 text-gray-700">
                                        <p>{model.details}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );
    }
};

export default MentalModelsList;
