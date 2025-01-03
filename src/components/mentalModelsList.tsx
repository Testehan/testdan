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
        { name: "Reward and Punishment Super-response Tendency", details: "TODO" },
        { name: "Liking/Loving Tendency", details:
                "<b>What It Is</b>: Refers to the disproportionate influence that positive feelings (liking or loving) have on our thoughts, judgments, and actions. Once we like or love someone or something, we tend to:" +
                "<ol class=\"list-decimal pl-4\">" +
                    "<li>" + "Overlook flaws in the object of our affection." + "</li>" +
                    "<li>" + "Overemphasize positives and assume the person or thing is better than it truly is." + "</li>" +
                    "<li>" + "Feel loyalty and defend the object of our liking, even when doing so is irrational or harmful." + "</li>" +
                "</ol>"+

                "<b>Why Did It Evolve</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                    "<li>" + "Social Cohesion: Humans evolved in groups, and forming strong bonds with others was essential for survival. Liking and loving help us build trust and cooperation, fostering alliances and mutual support." + "</li>" +
                    "<li>" + "Simplified Decision-Making: Favoring things or people we like reduces cognitive load and speeds up decisions. It’s cognitively simpler to take one attribute you like about someone (e.g. looks) and extend that to other qualities about the person" + "</li>" +
                "</ol>"+

                "<b>How Can It Be Harmful</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                    "<li>" + "Blindness to Flaws: Overlooking negative traits in people or ideas we like can lead to poor decisions" + "</li>" +
                    "<li>" + "Confirmation Bias Amplification: Liking someone or something makes us seek out and emphasize information that confirms our positive feelings, ignoring contrary evidence." + "</li>" +
                    "<li>" + "Exploitation: Manipulators (e.g., marketers, con artists) exploit this tendency by making themselves or their products likable, bypassing rational scrutiny." + "</li>" +
                    "<li>" + "Overcommitment: Loving an idea or project can lead to sunk cost fallacy, where we continue investing time, money, or energy even when it’s not rational." + "</li>" +
                "</ol>"+

                "<b>Examples in Real Life</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                    "<li>" + "Personal Relationships: Overlooking red flags in a romantic partner because of infatuation." + "</li>" +
                    "<li>" + "Business: CEOs may favor ideas or colleagues they personally like, leading to suboptimal decisions. Customers may choose products from brands they \"love\" despite better alternatives." + "</li>" +
                    "<li>" + "Marketing: Advertisers create likable brand personalities or use celebrities to trigger this tendency." + "</li>" +
                "</ol>"+

                "<b>Antidotes</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                    "<li>" + "Awareness and Reflection: Recognize when emotions are clouding judgment. Ask yourself: \"Would I make the same decision if I didn’t like this person/product?\"" + "</li>" +
                    "<li>" + "Focus on Evidence: Base decisions on facts and objective criteria rather than feelings." + "</li>" +
                    "<li>" + "Maintain Emotional Distance: When evaluating people or ideas, try to separate personal affection from professional or logical considerations." + "</li>" +
                "</ol>"
        },

        { name: "Disliking/Hating Tendency", details:
                "<b>What It Is</b>: Once we dislike or hate someone or something, our thoughts, behaviors, and actions often become colored by these feelings, leading to irrational or destructive outcomes." +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Exaggerate the negative aspects of someone or something we dislike" + "</li>" +
                "<li>" + "Dismiss or overlook positive qualities or evidence that contradicts our negative feelings." + "</li>" +
                "<li>" + "Feel loyalty and defend the object of our liking, even when doing so is irrational or harmful." + "</li>" +
                "</ol>"+

                "<b>Why Did It Evolve</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Survival Instincts: Early humans needed to identify and respond quickly to threats, often forming aversions to things or individuals perceived as dangerous or harmful." + "</li>" +
                "<li>" + "Tribalism: Disliking or hating outsiders fostered group cohesion and loyalty, which was crucial for survival in small, competitive groups." + "</li>" +
                "<li>" + "Simplified Decision-Making: Negative feelings allow for quick decision-making by avoiding things or people associated with harm or risk." + "</li>" +
                "</ol>"+

                "<b>How Can It Be Harmful</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Cognitive Distortion: Hatred or dislike can lead to confirmation bias, where we only seek evidence that reinforces our negative feelings. Ignoring virtues can further intensify dislike, causing feedback loops" + "</li>" +
                "<li>" + "Unjust Treatment: Disliking someone can cause unfair treatment or exclusion, even when they deserve fair consideration." + "</li>" +
                "<li>" + "Escalation of Conflict: Strong negative emotions can escalate minor disagreements into significant conflicts" + "</li>" +
                "<li>" + "Missed Opportunities: Disliking someone or something might lead to rejecting valuable relationships, ideas, or opportunities." + "</li>" +
                "</ol>"+

                "<b>Examples in Real Life</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Personal Relationships: Avoiding a family member because of a past argument, even when reconciliation is possible." + "</li>" +
                "<li>" + "Politics: People voting against policies or leaders solely based on party affiliation or personal dislike." + "</li>" +
                "<li>" + "Marketing: Avoiding products or services from a disliked company, even if they are superior or more affordable." + "</li>" +
                "</ol>"+

                "<b>Antidotes</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Awareness and Reflection: Acknowledge when emotions of dislike or hatred are influencing your decisions. Ask yourself: \"Am I being fair and objective?\"" + "</li>" +
                "<li>" + "Focus on Evidence: Base decisions on facts and objective criteria rather than feelings." + "</li>" +
                "<li>" + "Maintain Emotional Distance: When evaluating people or ideas, try to separate personal affection from professional or logical considerations." + "</li>" +
                "<li>" + "Pause and Reflect: Avoid making decisions when angry or upset. Give yourself time to cool down." + "</li>" +
                "<li>" + "Invert, always invert: what can you find to like about an object/person of your hatred/dislike? How can you come to accept this object? What does the best case scenario look like?  How many good things you can say about it?" + "</li>" +
                "</ol>"
        },

        { name: "Doubt-Avoidance Tendency", details:
                "<b>What It Is</b>: Describes the human propensity to avoid uncertainty and doubt by rushing to make decisions or adopting definitive beliefs, even when there is incomplete information. This tendency can lead to hasty, poorly thought-out actions and an inability to handle ambiguity effectively." +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Humans dislike uncertainty and often experience discomfort when they are unsure about something." + "</li>" +
                "<li>" + "To reduce this discomfort, people tend to make decisions quickly, even if they lack sufficient evidence." + "</li>" +
                "<li>" + "It leads to an overconfidence in conclusions, beliefs, or decisions that may not be accurate or optimal." + "</li>" +
                "</ol>"+

                "<b>Why Did It Evolve</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Survival in Threatening Environments: In ancestral environments, quick decisions were often necessary for survival (e.g., deciding whether a shadow is a predator or not)." + "</li>" +
                "<li>" + "Cognitive Efficiency: Avoiding doubt conserves mental energy. Processing uncertainty and weighing probabilities require effort, and this tendency reduces cognitive load." + "</li>" +
                "<li>" + "Social Cohesion: Being decisive or conforming to group decisions fosters harmony within social groups, even at the cost of accuracy.." + "</li>" +
                "<li>" + "Emotional Comfort: Resolving doubt provides psychological relief, reducing stress and anxiety associated with ambiguity." + "</li>" +
                "</ol>"+

                "<b>How Can It Be Harmful</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Premature Decisions: People may make decisions before gathering all relevant information (investing in a stock based on a short article)." + "</li>" +
                "<li>" + "Resistance to Change: Once a decision is made, individuals may avoid revisiting it, even when new evidence suggests they should." + "</li>" +
                "<li>" + "Oversimplification of Complex Issues: Ambiguous or complex problems are often reduced to simple, black-and-white answers." + "</li>" +
                "<li>" + " Manipulation by Others: Marketers, politicians, and other persuaders exploit this tendency by offering seemingly simple solutions to complex problems (ex: This product guarantees weight loss with no effort.)." + "</li>" +
                "</ol>"+

                "<b>Examples in Real Life</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Personal Decisions: Marrying someone or moving to a new city quickly without fully considering all factors because uncertainty feels uncomfortable." + "</li>" +
                "<li>" + "Politics and Society: People rallying around charismatic leaders who offer simple, decisive answers to complex societal problems." + "</li>" +
                "</ol>"+

                "<b>Antidotes</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Acknowledge Ambiguity: Accept that doubt is a natural part of life and that not all questions have immediate answers. Embrace the phrase: \"I don’t know yet.\"" + "</li>" +
                "<li>" + "Delay Judgment: Avoid rushing to conclusions. Allow time to gather evidence and reflect on different possibilities. Judges and jurors are forced to delay decisions exactly for this reason…this can also be applied to stock buying/selling" + "</li>" +
                "<li>" + "Seek Diverse Perspectives: Consult multiple viewpoints to reduce the risk of oversimplified decisions." + "</li>" +
                "<li>" + "Develop Comfort with Uncertainty: Practice mindfulness or other techniques to become more at ease with ambiguous situations." + "</li>" +
                "<li>" + "Iterative Decision-Making: Make small, reversible decisions instead of committing to a single, all-encompassing choice." + "</li>" +
                "<li>" + "Learn Critical Thinking Skills: Question assumptions, analyze evidence, and evaluate arguments objectively" + "</li>" +
                "</ol>"
        },

        { name: "Inconsistency-Avoidance Tendency", details: "TODO" },
        { name: "Curiosity Tendency", details: "" },
        { name: "Kantian Fairness Tendency", details: "" },
        { name: "Envy/Jealousy Tendency", details: "" },
        { name: "Reciprocation Tendency", details: "" },
        { name: "Influence-from-Mere-Association Tendency", details: "" },
        { name: "Simple, Pain-Avoiding Psychological Denial", details: "" },
        { name: "Excessive Self-Regard Tendency", details: "" },
        { name: "Overoptimism Tendency", details: "" },
        { name: "Deprival-Superreaction Tendency", details: "" },
        { name: "Social-Proof Tendency", details: "" },
        { name: "Contrast-Misreaction Tendency", details: "" },
        { name: "Stress-Influence Tendency", details: "" },
        { name: "Availability-Misweighing Tendency", details: "" },
        { name: "Use-It-or-Lose-It Tendency", details: "" },
        { name: "Drug-Misinfluence Tendency", details: "" },
        { name: "Senescence-Misinfluence Tendency", details: "" },
        { name: "Authority-Misinfluence Tendency", details: "" },
        { name: "Twaddle Tendency", details: "" },
        { name: "Reason-Respective Tendency", details: "" },
        { name: "Lollapalooza Tendency", details: "" },
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
