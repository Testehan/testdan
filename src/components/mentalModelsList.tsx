import {useState} from "react";
import { useNavigate, useParams } from "react-router-dom";


const mentalModels = {
    "General thinking tools": [
        { name: "Inversion", details: "<b>What It Is</b>: Thinking backward by considering what you want to avoid or the opposite of what you want to achieve." +
                "<br/> <b>Use Case</b>: Solve problems by identifying pitfalls or failures." +
                "<br/> <b>Example</b>: Instead of asking, \"How do I succeed?\" ask, \"How could I fail?\"" },

        { name: "The map is not the territory", details: "<b>What It Is</b>: Models and representations are simplifications and do not fully represent reality." +
                "<br/> <b>Use Case:</b> Recognize the limitations of frameworks, charts, or diagrams." +
                "<br/> <b>Example</b>: A business model doesn’t account for all the nuances of human behavior or financial statements tell just one part about a company." },

        { name: "Circle of competence", details: "<b>What It Is</b>: Focus on areas where you have knowledge and expertise.\n" +
                "<br/> <b>Use Case</b>: Avoid mistakes by staying within your skill set.\n" +
                "<br/> <b>Example</b>: Warren Buffett avoids investing in industries he doesn’t understand." +
                "\"I'm no genius. I'm smart in sports - but i stay around those spots.\"" },

        { name: "First Principles Thinking", details: "<b>What It Is</b>: Breaking down a problem into its most basic, foundational elements and building up from there." +
                "<br/> <b>Use Case</b>: Elon Musk famously uses this for innovation and problem-solving." +
                "<br/> <b>Example</b>: Instead of saying \"batteries are expensive,\" ask why they are expensive and explore ways to reduce cost from the ground up." },

        { name: "Second Order Thinking", details: "<b>What It Is</b>: Considering the long-term and indirect consequences of your actions or decisions." +
                "<br/> <b>Use Case</b>: Helps in avoiding unintended consequences.\n" +
                "<br/> <b>Example</b>: A company lowers prices to gain market share but doesn’t account for losing premium customers who value quality over price." },

        { name: "Thought experiment", details: " <b>What it is</b>:" +
                "A thought experiment is imagining hypothetical scenarios to explore ideas or solve problems without real-world testing." +
                "<br/> <b>Use Case</b>:" +
                "Philosophy: To explore ethical dilemmas and abstract concepts." +
                "Science: To test theories that can't be physically experimented with." +
                "Problem-Solving: To reason through complex situations and predict outcomes." +
                "<br/> <b>Example</b>: The Trolley Problem: A moral dilemma where you choose between saving five or one person." },

        { name: "Probabilistic thinking", details: "<b>What it is</b>:" +
                "Probabilistic thinking involves making decisions based on the likelihood of different outcomes rather than certainty." +
                "<br/> <b>Use Case</b>:" +
                "Risk Management: To assess and mitigate potential risks in uncertain environments." +
                "Investing: To evaluate opportunities based on expected returns and probabilities." +
                "Everyday Decisions: To make better choices by considering the odds and not just possibilities." +
                "<br/> <b>Example</b>:" +
                "Medical Diagnosis: Doctors often use probabilistic thinking to determine the likelihood of a patient having a certain condition based on symptoms, medical history, and test results." +
                "Business Decisions: Companies assess the probability of a product's success in the market by analyzing customer behavior, competition, and trends." +
                "Insurance: Insurers use probabilistic models to set premiums by calculating the likelihood of an event (like an accident or house fire) occurring."},

        { name: "Occam's Razor", details: "<b>What It Is</b>: Simpler explanations are generally better than complex ones." +
                "<br/> <b>Use Case</b>: Choose the most straightforward solution that works." +
                "<br/> <b>Example</b>: If a car doesn’t start, the simplest explanation might be that it’s out of gas rather than a complex engine failure." },

        { name: "Hanlon's Razor", details: "<b>What It Is</b>: Never attribute to malice that which is adequately explained by incompetence or stupidity." +
                "<br/> <b>Use Case</b>: Helps avoid jumping to conclusions." +
                "<br/> <b>Example</b>: If a colleague misses a deadline, it’s likely poor time management rather than intentional sabotage." },
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
                                        <div
                                            dangerouslySetInnerHTML={{ __html: model.details }}
                                        />
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
