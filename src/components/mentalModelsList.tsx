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

        { name: "Inconsistency-Avoidance Tendency", details:
                "<b>What It Is</b>: Refers to the human inclination to resist changes that would create inconsistencies in beliefs, actions, or commitments.." +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Cognitive Alignment: Humans strive for harmony between their beliefs, values, and actions (a concept also known as cognitive consistency. When confronted with information or situations that challenge their current stance, they may ignore or rationalize away the contradiction" + "</li>" +
                "<li>" + "Avoidance of Change: People are reluctant to change. This applies to personal behaviour, beliefs, relationships, commitments." + "</li>" +
                "<li>" + "Habit changing is hard, despite people knowing their habits are bad." + "</li>" +
                "<li>" + "Commitment Bias: Once a commitment is made, individuals often continue down the same path to avoid admitting they were wrong “The human mind works a lot like a human egg. When one sperm gets into a human egg, there’s an automatic shut-off device that bars any other sperm from getting in.”" + "</li>" +
                "<li>" + "Confirmation bias: is the tendency to search for, interpret, favour, and recall information in a way that confirms one's preexisting beliefs or hypotheses. People display this bias when they gather or remember information selectively, or when they interpret it in a biased way. The effect is stronger for emotionally charged issues and for deeply entrenched beliefs" + "</li>" +
                "</ol>"+

                "<b>Why Did It Evolve</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Efficient Decision-Making: Maintaining consistency reduces cognitive load. It’s easier to stick with past decisions than to constantly reevaluate them." + "</li>" +
                "<li>" + "Social Stability: Consistent individuals are seen as reliable, predictable, and trustworthy within groups, fostering better social cohesion." + "</li>" +
                "<li>" + "Emotional Comfort: Consistency reduces the discomfort of cognitive dissonance (the tension that arises from holding conflicting beliefs or behaving contrary to one’s values)." + "</li>" +

                "</ol>"+

                "<b>How Can It Be Harmful</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Resistance to Change: Early-formed habits may be destiny, since they are so hard to change" + "</li>" +
                "<li>" + "Perpetuation of Errors: Persisting with incorrect beliefs or harmful behaviors to maintain consistency." + "</li>" +
                "<li>" + "Rationalization of Poor Decisions: Justifying bad choices rather than admitting a mistake (ex smokers)." + "</li>" +
                "<li>" + "Groupthink: In groups, the desire for consistency can lead to conformity, suppressing dissent and critical thinking." + "</li>" +

                "</ol>"+

                "<b>Examples in Real Life</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Social: Hazing rituals as initiations into groups strengthen the tie (through cognitive dissonance – “there’s no way I would go through that if I weren’t really into the group.”)" + "</li>" +
                "<li>" + "Science: many times in the history of science, scientists have resisted new discoveries by selectively interpreting or ignoring unfavourable data" + "</li>" +
                "<li>" + "Health Choices: Refusing to adopt healthier habits because they contradict long-standing routines" + "</li>" +

                "</ol>"+

                "<b>Antidotes</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Seek Contradictory Evidence: Consider counterarguments to your position before making decisions. In fact, you should actively seek out opposition to your favourite ideas...Jury trials force listening of both sides before a verdict." + "</li>" +
                "<li>" + "Focus on Outcomes: An ounce of prevention is a pound of cure. Don’t start smoking or gambling, particularly in response to doubt or a problem (like unhappiness)." + "</li>" +
                "<li>" + "Practice Cognitive Flexibility: If you hate a political opponent, force yourself to know and like someone who follows the opponent. This will help you see the virtue in the other side and correct your hating tendency." + "</li>" +
                "<li>" + "Fake it til you make it: picture the kind of person you want to be and act in accordance with that. For example, “I’m the type of person who likes waking up and exercising.” Your behaviour will rectify your prior self-belief (“I’m a lazy no good nothing”) so that you eventually believe you become the type of person you want to be." + "</li>" +
                "</ol>"
        },
        { name: "Curiosity Tendency", details:
                "<b>What It Is</b>: Refers to the innate human drive to seek knowledge, explore, and understand the unknown. This tendency has been instrumental in our development as a species, driving innovation, learning, and discovery." +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "I have no special talents. I am only passionately curious. ~Albert Einstein" + "</li>" +

                "</ol>"+

                "<b>Why Did It Evolve</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Survival Advantage: Early humans needed to explore their environments to find food, avoid predators, and discover useful resources." + "</li>" +
                "<li>" + "Learning and Adaptation: Curiosity drove the acquisition of knowledge about tools, social dynamics, and natural phenomena, enabling better problem-solving" + "</li>" +

                "</ol>"+

                "<b>How Can It Be Harmful</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Distraction: Excessive curiosity can lead to wasted time on trivial or irrelevant matters, detracting from more critical tasks (rabbit hole of internet searches..never ending internet pages)" + "</li>" +
                "<li>" + "Information Overload: In the modern age, endless streams of information can overwhelm the curious mind, leading to decision fatigue or paralysis" + "</li>" +

                "</ol>"+

                "<b>Examples in Real Life</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Positive Examples: Scientific breakthroughs, like the discovery of penicillin, driven by curiosity about mold contamination" + "</li>" +
                "<li>" + "Negative Examples: gossip and curiosity about others' private lives" + "</li>" +

                "</ol>"+

                "<b>Antidotes</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Channel Curiosity Productively: Focus your curiosity on meaningful, beneficial pursuits that align with your goals.." + "</li>" +
                "<li>" + "Set Boundaries: Recognize when curiosity becomes a distraction or an invasion of privacy, and consciously redirect it" + "</li>" +
                "<li>" + "Learn to Prioritize: Not all questions need answers immediately. Prioritize what’s worth exploring based on relevance and importance" + "</li>" +
                "<li>" + "Balance Exploration with Focus: While curiosity encourages exploration, balance it with sustained attention on key areas of interest." + "</li>" +

                "</ol>"
        },
        { name: "Kantian Fairness Tendency", details:
                "<b>What It Is</b>: reflects the human inclination to seek and uphold fairness in interpersonal and societal interactions. It is based on the principle that individuals should act according to rules they would want universally applied, fostering justice and equity" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Problem: The pursuit of perfect fairness which causes a lot of terrible problems. Stop expecting the world to be fair and adjust your behaviour accordingly" + "</li>" +
                "<li>" + "Equality and Reciprocity: People naturally expect a balance in social exchanges and recoil at perceived injustices, whether they are victims or observers" + "</li>" +

                "</ol>"+

                "<b>Why Did It Evolve</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Group Cohesion: Early humans lived in small, cooperative groups where fairness was essential for trust, collaboration, and survival " + "</li>" +
                "<li>" + "Learning and Adaptation: Curiosity drove the acquisition of knowledge about tools, social dynamics, and natural phenomena, enabling better problem-solving" + "</li>" +
                "<li>" + "Conflict Reduction: Fair treatment reduced tensions and disputes, fostering harmonious social environments" + "</li>" +

                "</ol>"+

                "<b>How Can It Be Harmful</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Rigid Application: Overemphasis on fairness can lead to inefficiency or harm in situations requiring flexibility. Example: Insisting on equal rewards despite unequal contributions in a group. Charlie Munger also likes the Navy rule of being dismissed as an officer if you run your ship aground – not fair in all circumstances, but certainly prevents ships from being run aground" + "</li>" +
                "<li>" + "Perception of Injustice: What is 'fair' is subjective, leading to disagreements and conflicts when different parties have conflicting views." + "</li>" +
                "<li>" + "Paralysis by Fairness: Excessive concern for fairness may cause indecision or inaction, especially in complex situations with competing interests" + "</li>" +
                "<li>" + "Impediment to Meritocracy: Pursuing strict equality over equity (fairness based on merit) can discourage excellence and innovation." + "</li>" +

                "</ol>"+

                "<b>Examples in Real Life</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Positive Examples: Scientific breakthroughs, like the discovery of penicillin, driven by curiosity about mold contamination" + "</li>" +
                "<li>" + "Negative Examples: gossip and curiosity about others' private lives" + "</li>" +

                "</ol>"+

                "<b>Antidotes</b>:" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Channel Curiosity Productively: Focus your curiosity on meaningful, beneficial pursuits that align with your goals.." + "</li>" +
                "<li>" + "Set Boundaries: Recognize when curiosity becomes a distraction or an invasion of privacy, and consciously redirect it" + "</li>" +
                "<li>" + "Learn to Prioritize: Not all questions need answers immediately. Prioritize what’s worth exploring based on relevance and importance" + "</li>" +
                "<li>" + "Balance Exploration with Focus: While curiosity encourages exploration, balance it with sustained attention on key areas of interest." + "</li>" +

                "</ol>"
        },
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
    "Economics": [
        {
            name: "Scarcity",
            details: "<b>What It Is</b>: The principle that limited availability increases perceived value and demand." +
                "<br/> <b>Use Case</b>: Used in marketing, decision-making, and behavioral economics to influence choices." +
                "<br/> <b>Example</b>: Limited-time offers or exclusive products create urgency and drive purchases."
        },
        {
            name: "Supply and Demand",
            details: "<b>What It Is</b>: A fundamental economic concept where price is determined by the relationship between availability (supply) and desire (demand)." +
                "<br/> <b>Use Case</b>: Helps businesses set prices, predict market trends, and optimize inventory." +
                "<br/> <b>Example</b>: When a product is in high demand but low supply, prices increase (e.g., concert tickets, real estate in prime locations)."
        },
        {
            name: "Optimization",
            details: "<b>What It Is</b>: The process of making something as effective or efficient as possible." +
                "<br/> <b>Use Case</b>: Applied in engineering, business, and decision-making to maximize performance or minimize waste." +
                "<br/> <b>Example</b>: A/B testing in marketing to find the best-performing ad copy or website design."
        },
        {
            name: "Trade-offs",
            details: "<b>What It Is</b>: The concept that choosing one option often means giving up another due to limited resources." +
                "<br/> <b>Use Case</b>: Helps in decision-making by weighing the costs and benefits of different choices." +
                "<br/> <b>Example</b>: Spending more on quality materials increases product durability but raises costs."
        },
        {
            name: "Specialization",
            details: "<b>What It Is</b>: Focusing on a specific skill, task, or industry to improve efficiency and expertise." +
                "<br/> <b>Use Case</b>: Increases productivity and innovation by allowing individuals or businesses to become experts in their fields." +
                "<br/> <b>Example</b>: A heart surgeon is more skilled at cardiac procedures than a general doctor due to specialized training."
        },
        {
            name: "Interdependence",
            details: "<b>What It Is</b>: The idea that individuals, businesses, or nations rely on each other for goods, services, or knowledge." +
                "<br/> <b>Use Case</b>: Encourages collaboration and efficiency in global trade and economies." +
                "<br/> <b>Example</b>: Tech companies depend on chip manufacturers to produce smartphones and computers."
        },
        {
            name: "Efficiency",
            details: "<b>What It Is</b>: The ability to achieve maximum productivity with minimal wasted resources." +
                "<br/> <b>Use Case</b>: Helps businesses reduce costs, improve output, and optimize performance." +
                "<br/> <b>Example</b>: Assembly lines in manufacturing increase production speed while reducing labor costs."
        },
        {
            name: "Debt",
            details: "<b>What It Is</b>: Borrowing resources (usually money) with a promise of repayment, often with interest." +
                "<br/> <b>Use Case</b>: Used by individuals, businesses, and governments to finance growth or investments." +
                "<br/> <b>Example</b>: A startup takes out a loan to scale its operations, expecting future profits to cover repayments."
        },
        {
            name: "Monopoly",
            details: "<b>What It Is</b>: A market structure where a single entity dominates, limiting competition." +
                "<br/> <b>Use Case</b>: Can lead to higher prices and reduced innovation due to lack of competition." +
                "<br/> <b>Example</b>: A utility company being the sole provider of electricity in a region, leaving consumers with no alternatives."
        },
        {
            name: "Competition",
            details: "<b>What It Is</b>: The rivalry between individuals or businesses striving for a common goal, often market dominance." +
                "<br/> <b>Use Case</b>: Drives innovation, better products, and lower prices for consumers." +
                "<br/> <b>Example</b>: Apple and Samsung constantly innovating to outperform each other in the smartphone market."
        },
        {
            name: "Creative Destruction",
            details: "<b>What It Is</b>: The process by which innovation disrupts and replaces outdated industries or businesses." +
                "<br/> <b>Use Case</b>: Explains how progress leads to the rise of new technologies while making old ones obsolete." +
                "<br/> <b>Example</b>: Streaming services like Netflix replacing DVD rental businesses like Blockbuster."
        },
        {
            name: "Gresham's Law",
            details: "<b>What It Is</b>: The economic principle that 'bad money drives out good money' when both are in circulation." +
                "<br/> <b>Use Case</b>: Helps explain why people hoard valuable currency and use devalued or lower-quality money in transactions." +
                "<br/> <b>Example</b>: When a country issues both gold coins and paper money, people tend to hoard gold and spend paper currency."
        },
        {
            name: "Bubbles",
            details: "<b>What It Is</b>: Economic cycles where asset prices rise rapidly due to speculation, often followed by a sharp crash." +
                "<br/> <b>Use Case</b>: Helps investors and policymakers recognize unsustainable market trends before they collapse." +
                "<br/> <b>Example</b>: The 2000 dot-com bubble, where internet stocks were massively overvalued before crashing."
        }
    ],
    "Problem Solving": [
        { name: "First Principles Thinking", details: "Breaking down problems to their basic components." },
        { name: "Lateral Thinking", details: "Solving problems through an indirect and creative approach." },
    ]
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
