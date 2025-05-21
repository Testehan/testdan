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
        { name: "Envy/Jealousy Tendency", details:
                "<div>" +
                "<p><b>What It Is</b>: Refers to the distress experienced due to the perception that another person or group has an advantage, such as status, possessions, or achievements, which one desires and either does not possess or wants more of. It is often accompanied by feelings of resentment, bitterness, inferiority, or ill will toward the envied person or group.</p>" +
                "<p><b>Why Did It Evolve</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Social Comparison: Humans evolved in social groups where relative status and resources often determined survival and reproductive success. Envy may have evolved as a mechanism to monitor social hierarchies, assess one’s position, and motivate actions to improve one’s standing." + "</li>" +
                "<li>" + "Resource Acquisition: Envy could drive individuals to compete for scarce resources, improving their access to essentials like food, mates, and territory." + "</li>" +
                "<li>" + "Social Learning: Observing the success of others and envying their accomplishments could prompt individuals to learn and adopt successful strategies, improving their own outcomes." + "</li>" +
                "</ol>" +
                "<p><b>How Can It Be Harmful</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Emotional Distress: Envy causes feelings of unhappiness, frustration, and resentment, eroding mental well-being." + "</li>" +
                "<li>" + "Damaged Relationships: Envy can lead to spiteful behavior, undermining trust and cooperation with others, even among friends and family." + "</li>" +
                "<li>" + "Focus on External Validation: Envy directs attention outward, making personal satisfaction dependent on external factors (such as others’ achievements) rather than intrinsic goals and efforts." + "</li>" +
                "<li>" + "Malicious Behavior: Envy may cause negative and harmful actions towards others, such as sabotage, gossip, or theft." + "</li>" +
                "<li>" + "Lost Opportunities: Focus on what others have can distract from pursuing personal goals, leading to wasted time and resources." + "</li>" +
                "</ol>" +
                "<p><b>Examples in Real Life</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Workplace: An employee envies a colleague's promotion and spreads rumors to discredit their achievements." + "</li>" +
                "<li>" + "Social Media: Users experience envy seeing others' glamorous lives and start questioning their own life choices and happiness." + "</li>" +
                "<li>" + "Personal Relationships: One partner envies the other’s career success, leading to arguments and strained dynamics." + "</li>" +
                "<li>" + "Financial Contexts: Individuals might make risky investments to mimic the perceived success of others, leading to financial losses." + "</li>" +
                "</ol>" +
                "<p><b>Antidotes</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Self-Awareness and Reflection: Recognize when you're experiencing envy and understand its roots. Asking yourself why someone else's success bothers you can help clarify your own goals and values." + "</li>" +
                "<li>" + "Practice Gratitude and Appreciation: Focus on what you have rather than what you lack. Regular gratitude exercises or journaling can shift your perspective towards appreciation." + "</li>" +
                "<li>" + "Cultivate Self-Compassion: Treat yourself with the same kindness and understanding you would offer a friend who is struggling. This helps counteract negative self-evaluations and build self-worth." + "</li>" +
                "<li>" + "Focus on Personal Growth and Goals: Redirect your energy towards achieving your own aspirations rather than fixating on others’ achievements. Set clear, measurable goals and celebrate your progress." + "</li>" +
                "<li>" + "Limit Social Comparison: Reduce exposure to triggers, such as social media, that fuel envy. Instead, engage in activities and environments that affirm your sense of self and well-being." + "</li>" +
                "<li>" + "Reframe Envy as Inspiration: Use others’ successes as motivation rather than a source of bitterness. Learn from their strategies and apply those insights to your own pursuits." + "</li>" +
                "</ol>" +
                "</div>"
        },
        { name: "Reciprocation Tendency", details:
                "<div>" +
                "<p><b>What It Is</b>: This is the innate human inclination to respond to a positive action with another positive action (reciprocal altruism), or a negative action with another negative one (reciprocal aggression). It is based on the social norm of returning favors, gifts, or concessions.</p>" +
                "<p><b>Why Did It Evolve</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Social Cohesion: It helps build trust and maintain cooperative relationships within groups. By reciprocating, individuals show reliability and willingness to participate in social exchanges." + "</li>" +
                "<li>" + "Mutual Support: In early human societies, reciprocating favors or assistance helped ensure mutual support, resource sharing, and group survival." + "</li>" +
                "<li>" + "Fairness and Equity: It establishes a sense of fairness and balance in interactions, encouraging a system of exchanges where help is returned and harms are addressed." + "</li>" +
                "</ol>" +
                "<p><b>How Can It Be Harmful</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Exploitation: Manipulators can use reciprocity to influence decisions or actions by offering small favors or gifts, expecting disproportionate returns." + "</li>" +
                "<li>" + "Cycle of Retaliation: In conflicts, the tendency to reciprocate negative actions can escalate tensions, leading to prolonged disputes and cycles of violence." + "</li>" +
                "<li>" + "Poor Decision-Making: The desire to reciprocate can override rational thinking, leading to unfavorable exchanges or commitments made under pressure or influence." + "</li>" +
                "<li>" + "Unwanted Obligations: Reciprocation can create a sense of indebtedness that leads to unwanted or unnecessary exchanges, especially when the initial favor was not asked for." + "</li>" +
                "</ol>" +
                "<p><b>Examples in Real Life</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Gifts and Favors: Sending a thank-you note or a small gift after receiving hospitality from someone, reflecting the desire to show gratitude and reciprocate." + "</li>" +
                "<li>" + "Sales and Marketing: Providing free samples or trials to induce potential customers to feel obligated to purchase a product or service." + "</li>" +
                "<li>" + "Negotiations: Making a concession during business negotiations with the expectation that the other party will reciprocate with a similar concession." + "</li>" +
                "<li>" + "Conflict Resolution: Seeking reconciliation after a conflict by offering apologies or amends, hoping the other party will reciprocate and de-escalate the situation." + "</li>" +
                "</ol>" +
                "<p><b>Antidotes</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Awareness of Influence: Recognize when offers or favors might be used to influence your decisions. Reflect on your genuine motivations for reciprocating rather than feeling obligated." + "</li>" +
                "<li>" + "Evaluate the Value: Assess the true value of the exchange. Is the reciprocal action proportionate to the initial action, or is there an attempt to create an imbalance?" + "</li>" +
                "<li>" + "Maintain Boundaries: Set clear personal or professional boundaries on reciprocity to prevent exploitation. It's acceptable to decline offers that might lead to undesirable obligations." + "</li>" +
                "<li>" + "Focus on Long-Term Benefits: When considering reciprocation, prioritize long-term goals and relationships over immediate pressures or perceived obligations." + "</li>" +
                "<li>" + "Balance Actions and Motivations: Reciprocate when it aligns with your values and objectives, not merely out of a sense of forced obligation. Ensure actions are genuine and not driven by external manipulations." + "</li>" +
                "</ol>" +
                "</div>"
        },
        { name: "Social-Proof Tendency", details:
                "<div>" +
                "<p><b>What It Is</b>: The inclination to adopt beliefs or behaviors that are prevalent or endorsed by a group, assuming they are appropriate or correct, especially in ambiguous situations.</p>" +
                "<p><b>Why Did It Evolve</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Group Survival: In ancestral times, aligning with group behaviors increased survival chances, as collective knowledge and actions were often more effective than individual ones." + "</li>" +
                "<li>" + "Efficient Learning: Copying others' behavior is an efficient way to learn and adapt to new situations, avoiding the need to personally test every possibility." + "</li>" +
                "<li>" + "Social Cohesion: Conforming to group norms and practices fosters social harmony and acceptance within the community." + "</li>" +
                "</ol>" +
                "<p><b>How Can It Be Harmful</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Irrational Decisions: Following the crowd can lead to poor choices if the majority is misinformed or acting irrationally." + "</li>" +
                "<li>" + "Groupthink: In groups, social proof can suppress dissenting opinions and critical thinking, leading to suboptimal decisions." + "</li>" +
                "<li>" + "Manipulation: Marketers or influencers can exploit this tendency by creating the perception of widespread popularity or approval, regardless of actual merit." + "</li>" +
                "<li>" + "Bystander Effect: The tendency for individuals to not offer help in an emergency when others are present, assuming that if others are not reacting, the situation is not serious." + "</li>" +
                "<li>" + "Loss of Individuality: Overreliance on social proof may discourage independent thinking and personal initiative, leading to conformity and homogenized behavior." + "</li>" +
                "</ol>" +
                "<p><b>Examples in Real Life</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Consumer Behavior: Purchasing products with many positive reviews or endorsements, assuming their popularity reflects quality." + "</li>" +
                "<li>" + "Social Media: Liking or sharing content that is already popular, driven by the perception that it's valuable or interesting." + "</li>" +
                "<li>" + "Investing: Following investment trends based on widespread hype or media coverage, such as investing in a particular stock because \"everyone else is.\"" + "</li>" +
                "<li>" + "Cultural Norms: Adopting local customs or beliefs simply because they are widely practiced, without critical evaluation." + "</li>" +
                "<li>" + "Political Opinions: Endorsing political candidates or viewpoints that seem to have widespread support, possibly overlooking personal beliefs or values." + "</li>" +
                "</ol>" +
                "<p><b>Antidotes</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Independent Research: Conduct your own research and gather information from various sources before making decisions, avoiding reliance solely on popular opinion." + "</li>" +
                "<li>" + "Critical Thinking: Question assumptions and evaluate the evidence behind beliefs or behaviors, assessing their validity objectively." + "</li>" +
                "<li>" + "Diversity of Perspectives: Seek out diverse viewpoints and opinions, especially those that challenge conventional wisdom or popular trends." + "</li>" +
                "<li>" + "Self-Reflection: Understand your personal values and goals, and make decisions aligned with them rather than conforming to external pressures." + "</li>" +
                "<li>" + "Skepticism: Approach claims or trends with a healthy dose of skepticism, especially when there are strong social pressures to conform." + "</li>" +
                "<li>" + "Mindful Action: Be conscious of your actions and decisions, ensuring they are based on informed reasoning rather than a desire to fit in or follow the crowd." + "</li>" +
                "</ol>" +
                "</div>"
        },
        { name: "Influence-from-Mere-Association Tendency", details:
                "<div>" +
                "<p><b>What It Is</b>: The cognitive bias where people evaluate something based on its association with something else, rather than on its intrinsic merits. This means positive associations lead to favorable evaluations, and negative associations lead to unfavorable ones, often irrationally.</p>" +
                "<p><b>Why Did It Evolve</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Quick Assessment: In ancestral environments, quick assessments based on associations (e.g., associating a certain sound with danger) were often crucial for survival." + "</li>" +
                "<li>" + "Efficient Decision-Making: Relying on associations reduces cognitive load by simplifying decision-making, using existing mental shortcuts rather than analyzing every detail." + "</li>" +
                "<li>" + "Social Learning: Humans learn from observing others, adopting behaviors or preferences associated with successful or respected individuals within their group." + "</li>" +
                "</ol>" +
                "<p><b>How Can It Be Harmful</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Irrational Preferences: Forming preferences for products, brands, or individuals based on superficial associations rather than actual qualities (e.g., liking a product because a celebrity endorses it)." + "</li>" +
                "<li>" + "Stereotyping: Making generalizations about individuals or groups based on associations (e.g., judging someone's competence based on their clothing or accent)." + "</li>" +
                "<li>" + "Halo and Horns Effect: Allowing an overall impression of a person or thing to influence judgments about specific traits or aspects (e.g., if someone is attractive, they are also perceived as intelligent and trustworthy)." + "</li>" +
                "<li>" + "Guilt or Credit by Association: Unfairly attributing responsibility or praise to someone based on their connections to others or events, rather than their direct involvement." + "</li>" +
                "<li>" + "Misleading Marketing: Being influenced by advertising that associates products with desirable outcomes or emotions (e.g., associating a car with excitement and freedom, rather than its fuel efficiency or safety). (See advertising & politics)" + "</li>" +
                "</ol>" +
                "<p><b>Examples in Real Life</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Brand Loyalty: Consistently choosing a particular brand of coffee or clothing because of positive experiences associated with the brand's image or values." + "</li>" +
                "<li>" + "Political Affiliation: Supporting a political party because a respected family member or community figure aligns with that party." + "</li>" +
                "<li>" + "Product Endorsements: Believing that a product must be good because a well-known expert or celebrity recommends it, even without personal experience or evidence." + "</li>" +
                "<li>" + "Social Judgments: Forming opinions about someone based on their friendships or affiliations (e.g., assuming someone is intelligent because they are friends with high-achievers)." + "</li>" +
                "<li>" + "Investment Decisions: Investing in a company or asset simply because it is associated with a successful investor or a booming market trend." + "</li>" +
                "</ol>" +
                "<p><b>Antidotes</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Critical Evaluation: Question assumptions and examine the actual merits of a product, idea, or person rather than relying on superficial associations." + "</li>" +
                "<li>" + "Diverse Perspectives: Seek input from various sources to avoid bias from a single point of view or association, broadening the range of information and viewpoints considered." + "</li>" +
                "<li>" + "Independent Thinking: Make decisions based on reasoned analysis and personal experience rather than conforming to external influences or associations." + "</li>" +
                "<li>" + "Fact-Checking: Verify information and claims rather than accepting them based on their association with a trusted source or appealing narrative, ensuring accuracy." + "</li>" +
                "<li>" + "Self-Awareness: Recognize when associations may be influencing judgments and actively work to separate objective evaluation from subjective perceptions and biases." + "</li>" +
                "</ol>" +
                "</div>"
        },
        { name: "Simple, Pain-Avoiding Psychological Denial", details:
                "<div>" +
                "<p><b>What It Is</b>: The unconscious process of rejecting or distorting reality to avoid psychological discomfort. It's a defense mechanism the mind employs to protect itself from truths that are too painful or overwhelming to accept at the moment. This can manifest as a refusal to acknowledge facts, minimizing the significance of a situation, or blaming external factors.</p>" +
                "<p><b>Why Did It Evolve</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "<b>Coping Mechanism</b>: Denial can act as a temporary shield, giving an individual time to adjust to a traumatic event or shocking news." + "</li>" +
                "<li>" + "<b>Emotional Regulation</b>: It allows a person to continue functioning without being emotionally overwhelmed by painful realities." + "</li>" +
                "</ol>" +
                "<p><b>How Can It Be Harmful</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "<b>Prevents Problem-Solving</b>: Prolonged denial prevents individuals from addressing critical issues, whether in their health, relationships, or finances." + "</li>" +
                "<li>" + "<b>Distorts Reality</b>: It can lead to irrational decisions based on a distorted view of the world." + "</li>" +
                "</ol>" +
                "<p><b>Examples in Real Life</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "<b>Health</b>: Someone might ignore the symptoms of a serious illness to avoid the fear and anxiety associated with a potential diagnosis." + "</li>" +
                "<li>" + "<b>Addiction</b>: A person with a substance abuse problem might insist they are a 'social' user, thereby avoiding the need to seek help." + "</li>" +
                "<li>" + "<b>Financial Problems</b>: An individual might continue to spend lavishly despite mounting debt, denying the severity of their financial situation." + "</li>" +
                "</ol>" +
                "<p><b>Antidotes</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "<b>Self-Awareness</b>: Recognizing the tendency to avoid painful truths is the first step." + "</li>" +
                "<li>" + "<b>Objective Feedback</b>: Seeking input from trusted friends, family, or professionals can provide a more accurate view of reality." + "</li>" +
                "<li>" + "<b>Confronting Reality in Small Steps</b>: Gradually facing the issue can make it less overwhelming." + "</li>" +
                "</ol>" +
                "</div>"
        },
        { name: "Excessive Self-Regard Tendency", details:
                "<div>" +
                "<p><b>What It Is</b>: The tendency to overestimate one's own abilities, knowledge, importance, and judgment. This is a powerful bias that makes individuals think more highly of themselves than is objectively warranted.</p>" +
                "<p><b>Why Did It Evolve</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Confidence and Initiative: A certain level of self-regard can be beneficial for taking action, pursuing ambitious goals, and overcoming challenges. Believing in oneself can be a self-fulfilling prophecy." + "</li>" +
                "<li>" + "Resilience: Excessive self-regard can act as a buffer against failure and criticism, helping individuals maintain morale and persist despite setbacks." + "</li>" +
                "</ol>" +
                "<p><b>How Can It Be Harmful</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Ignoring Feedback: Overconfidence can lead individuals to dismiss valuable criticism or advice from others, hindering learning and improvement." + "</li>" +
                "<li>" + "Excessive Risk-Taking: An inflated sense of ability can result in taking on risks that are too large or poorly calculated, leading to significant losses or failures." + "</li>" +
                "<li>" + "Damaging Relationships: Arrogance and a lack of humility stemming from excessive self-regard can strain interpersonal relationships, making collaboration and effective communication difficult." + "</li>" +
                "<li>" + "Poor Decision-Making: Overestimating one's knowledge can lead to decisions based on incomplete or flawed understanding." + "</li>" +
                "</ol>" +
                "<p><b>Examples in Real Life</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Entrepreneurship: An entrepreneur overestimates their ability to succeed in a highly competitive market, leading them to take on excessive debt and ultimately fail." + "</li>" +
                "</ol>" +
                "</div>" },
        { name: "Overoptimism Tendency", details:
                "<div>" +
                "<p><b>What It Is</b>: The tendency to be overly optimistic about outcomes, often underestimating potential negative results and risks.</p>" +
                "<p><b>Why Did It Evolve</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Motivation and Persistence: Optimism can be a powerful motivator, encouraging individuals to pursue challenging goals and persist in the face of difficulties. Believing in success can be a self-fulfilling prophecy." + "</li>" +
                "<li>" + "Stress Reduction: Focusing on positive possibilities can reduce anxiety and stress associated with uncertainty or potential negative outcomes." + "</li>" +
                "<li>" + "Social Acceptance: Optimism can be socially appealing, fostering positive interactions and connections with others." + "</li>" +
                "</ol>" +
                "<p><b>How Can It Be Harmful</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Underestimation of Risks: Overoptimism can lead individuals to ignore or downplay potential problems and risks, resulting in inadequate preparation or reckless decisions." + "</li>" +
                "<li>" + "Poor Planning: An overly positive outlook can hinder realistic planning and resource allocation, as challenges are not adequately anticipated." + "</li>" +
                "<li>" + "Disappointment and Demoralization: When overly optimistic expectations are not met, it can lead to significant disappointment, frustration, and even giving up." + "</li>" +
                "<li>" + "Financial Losses: In areas like investing or business, overoptimism can lead to excessive speculation or investment in ventures with low probability of success." + "</li>" +
                "</ol>" +
                "<p><b>Examples in Real Life</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Entrepreneurship: An entrepreneur believes their new venture will be an overnight success, neglecting market research and realistic financial projections." + "</li>" +
                "<li>" + "Project Management: A project manager overestimates the speed of tasks and underestimates potential delays, leading to missed deadlines and budget overruns." + "</li>" +
                "<li>" + "Investing: An investor believes a stock will continue to rise indefinitely, ignoring warning signs and failing to diversify their portfolio." + "</li>" +
                "<li>" + "Personal Health: Someone may be overly optimistic about their health, delaying check-ups or ignoring symptoms, leading to worse outcomes." + "</li>" +
                "</ol>" +
                "</div>" },
        { name: "Deprival-Superreaction Tendency", details:
                "<div>" +
                "<p><b>What It Is</b>: Refers to the intense negative reaction experienced when something one possesses or is about to possess is taken away or lost. The pain of losing something is often felt more strongly than the pleasure of gaining something equivalent.</p>" +
                "<p><b>Why Did It Evolve</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Loss Aversion: In ancestral environments, losing resources like food, shelter, or social status could have severe consequences for survival. A strong reaction to deprival may have motivated individuals to protect their existing resources fiercely." + "</li>" +
                "<li>" + "Status Maintenance: Maintaining one's position in social hierarchies was crucial. Losing status or possessions could lead to reduced access to resources and mates. The superreaction might have pushed individuals to defend their standing." + "</li>" +
                "</ol>" +
                "<p><b>How Can It Be Harmful</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Irrational Decisions: Fear of loss can lead to irrational risk-taking to avoid deprival or recover losses. This is a core element of prospect theory." + "</li>" +
                "<li>" + "Resistance to Change: People may resist beneficial changes or opportunities if they perceive them as involving the loss of something familiar, even if the new option is objectively better." + "</li>" +
                "<li>" + "Escalation of Commitment: Individuals may throw good money after bad in an attempt to recover previous investments or avoid the feeling of loss." + "</li>" +
                "<li>" + "Manipulation: Marketers, negotiators, and others can exploit this tendency by framing options in terms of potential losses rather than gains." + "</li>" +
                "</ol>" +
                "<p><b>Examples in Real Life</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Investing: Holding onto losing stocks for too long, hoping to recoup losses, even when selling is the more rational financial decision." + "</li>" +
                "<li>" + "Sales Tactics: Salespeople using phrases like, \"If you don't act now, you'll miss out on this limited-time offer,\" to trigger the fear of deprival." + "</li>" +
                "<li>" + "Negotiations: Refusing a reasonable compromise because it feels like losing something one initially demanded." + "</li>" +
                "<li>" + "Gambling: Chasing losses in an attempt to win back money that has been lost." + "</li>" +
                "</ol>" +
                "<p><b>Antidotes</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "Acknowledge Loss Aversion: Be aware that the pain of loss can cloud your judgment and lead to irrational behavior." + "</li>" +
                "<li>" + "Focus on Opportunity Cost: Instead of dwelling on what you might lose, consider what you gain or miss out on by not taking action or making a change." + "</li>" +
                "<li>" + "Evaluate Objectively: When facing potential losses, try to assess the situation based on facts and rational analysis rather than emotional reactions." + "</li>" +
                "<li>" + "Pre-mortem Analysis: Before making a decision, imagine that the outcome is a failure and work backward to identify what might have gone wrong. This can help anticipate potential losses and plan accordingly." + "</li>" +
                "</ol>" +
                "</div>" },
        { name: "Contrast-Misreaction Tendency", details:
                "<div>" +
                "<p><b>What It Is</b>: The tendency to judge things not on their absolute scale but based on their contrast to something else. Our perception is easily manipulated by the context and comparisons presented to us.</p>" +
                "<p><b>Why Did It Evolve</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "<b>Energy Conservation</b>: It's cognitively easier to compare two things than to evaluate one in isolation. The brain uses this shortcut to make quicker decisions." + "</li>" +
                "<li>" + "<b>Sensory Perception</b>: Our senses don't perceive absolute values well. For example, a room feels colder or warmer depending on the temperature outside. This extends to more complex judgments." + "</li>" +
                "</ol>" +
                "<p><b>How Can It Be Harmful</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "<b>Poor Financial Decisions</b>: Spending a little extra on an accessory after a large purchase (e.g., a $100 case for a $1,000 phone) seems insignificant by contrast, but may be an objectively poor value." + "</li>" +
                "<li>" + "<b>Manipulation by Salespeople</b>: A salesperson might show you a very expensive, undesirable option first to make the next, more reasonable option seem like a great deal (the decoy effect)." + "</li>" +
                "<li>" + "<b>The 'Boiling Frog' Effect</b>: Gradual, slow changes are hard to perceive because they lack contrast with the immediate past. This can lead to accepting a gradually worsening situation until it becomes a disaster." + "</li>" +
                "</ol>" +
                "<p><b>Examples in Real Life</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "<b>Real Estate</b>: An agent shows you several overpriced, rundown houses before showing you a mediocre one at a slightly high price, making it look attractive by comparison." + "</li>" +
                "<li>" + "<b>Luxury Goods</b>: A $5,000 handbag seems reasonable when placed next to a $20,000 one." + "</li>" +
                "<li>" + "<b>Negotiations</b>: Starting with an unreasonably high anchor makes the subsequent, more reasonable offer seem like a major concession." + "</li>" +
                "</ol>" +
                "<p><b>Antidotes</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "<b>Evaluate Independently</b>: Judge each option on its own merits, irrespective of what it's being compared to. Ask: 'Is this a good value in and of itself?'" + "</li>" +
                "<li>" + "<b>Be Aware of the Context</b>: Recognize when a comparison is being used to influence your perception." + "</li>" +
                "<li>" + "<b>Consider the Absolute Value</b>: Whenever possible, use absolute metrics and benchmarks rather than relative comparisons." + "</li>" +
                "<li>" + "<b>Evaluate Small Changes Over Time</b>: Don't just look at the contrast from one day to the next. Step back and evaluate the overall trend." + "</li>" +
                "</ol>" +
                "</div>"
        },
        { name: "Stress-Influence Tendency", details:
                "<div>" +
                "<p><b>What It Is</b>: The tendency for stress, especially when it's intense, to cloud judgment and lead to poor, often irrational, decisions. Under stress, the body's physiological and psychological responses can hijack rational thinking.</p>" +
                "<p><b>Why Did It Evolve</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "<b>Survival Instinct (Fight-or-Flight)</b>: In dangerous situations, stress triggers a rapid response mechanism that prioritizes immediate action over careful analysis. This was essential for escaping predators or fighting threats." + "</li>" +
                "<li>" + "<b>Performance Enhancement</b>: Mild stress can sometimes improve focus and performance on simple, well-rehearsed tasks." + "</li>" +
                "</ol>" +
                "<p><b>How Can It Be Harmful</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "<b>Impulsive and Short-Sighted Decisions</b>: Heavy stress narrows focus to immediate relief, leading to decisions that are not well thought out and have negative long-term consequences." + "</li>" +
                "<li>" + "<b>Amplification of Other Biases</b>: Stress can make other cognitive biases, like Social Proof (following the herd) and Doubt-Avoidance (rushing to a conclusion), much stronger." + "</li>" +
                "<li>" + "<b>Emotional Hijacking</b>: Intense stress can lead to emotional responses like panic, anger, or fear dominating the decision-making process." + "</li>" +
                "<li>" + "<b>Physical and Mental Health</b>: Chronic stress can lead to serious health issues, including depression and fatigue, which further impair judgment." + "</li>" +
                "</ol>" +
                "<p><b>Examples in Real Life</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "<b>Financial Markets</b>: Investors panic-selling their stocks during a market crash, driven by the stress of seeing their portfolio value drop." + "</li>" +
                "<li>" + "<b>Emergency Situations</b>: People making poor decisions during a crisis, such as hoarding supplies during a pandemic." + "</li>" +
                "<li>" + "<b>Workplace Pressure</b>: An employee under a tight deadline might make a critical error by rushing through their work." + "</li>" +
                "</ol>" +
                "<p><b>Antidotes</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "<b>Avoid High-Stakes Decisions Under Stress</b>: If possible, postpone important decisions until you are in a calmer state of mind." + "</li>" +
                "<li>" + "<b>Use Checklists and Pre-defined Procedures</b>: For predictable, high-stress situations, having a checklist can offload cognitive strain and ensure critical steps aren't missed." + "</li>" +
                "<li>" + "<b>Seek Outside Counsel</b>: Talk to a trusted, less-stressed individual to get a more objective perspective." + "</li>" +
                "<li>" + "<b>Practice Relaxation Techniques</b>: Methods like deep breathing, meditation, or taking a walk can help reduce the physiological effects of stress." + "</li>" +
                "</ol>" +
                "</div>"
        },
        { name: "Availability-Misweighing Tendency", details:
                "<div>" +
                "<p><b>What It Is</b>: The tendency to over-rely on information that is most easily recalled, vivid, or recent when making judgments. We misjudge the frequency and magnitude of events because some things are more memorable than others.</p>" +
                "<p><b>Why Did It Evolve</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "<b>Cognitive Shortcut</b>: It's an efficient mental shortcut (heuristic) to assess the likelihood of an event. If something is easy to recall, it must be important or common." + "</li>" +
                "<li>" + "<b>Threat Detection</b>: Vivid, dramatic events (like a predator attack) were crucial for survival, so our brains are wired to give them more weight." + "</li>" +
                "</ol>" +
                "<p><b>How Can It Be Harmful</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "<b>Distorted Risk Perception</b>: Leading to irrational fears, such as being more afraid of flying (vividly covered in media) than driving (statistically more dangerous)." + "</li>" +
                "<li>" + "<b>Poor Decision-Making</b>: Decisions are based on anecdotal evidence rather than data. A manager might hire someone from their alma mater just because they recently had a good experience with another graduate." + "</li>" +
                "<li>" + "<b>Manipulation by Media</b>: The media's focus on sensational stories (crime, terrorism) can make these events seem much more common than they are." + "</li>" +
                "</ol>" +
                "<p><b>Examples in Real Life</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "<b>Lottery Tickets</b>: People overestimate their chances of winning the lottery because the winners get widespread media coverage, making the event highly available." + "</li>" +
                "<li>" + "<b>Medical Diagnosis</b>: A doctor who has just seen a patient with a rare disease might be more likely to see it in the next patient, even if the symptoms are common." + "</li>" +
                "<li>" + "<b>Performance Reviews</b>: Managers often give more weight to recent performance (the recency effect) than performance over the entire year." + "</li>" +
                "</ol>" +
                "<p><b>Antidotes</b>:</p>" +
                "<ol class=\"list-decimal pl-4\">" +
                "<li>" + "<b>Use Data and Statistics</b>: Actively seek out and rely on objective data rather than memorable anecdotes." + "</li>" +
                "<li>" + "<b>Seek Disconfirming Evidence</b>: Look for information that challenges your easily-recalled examples." + "</li>" +
                "<li>" + "<b>Use Checklists and Formal Processes</b>: For important decisions, use a structured process to ensure all factors are considered, not just the most available ones." + "</li>" +
                "<li>" + "<b>Consider the Base Rate</b>: Pay attention to the statistical probability of an event (the base rate) rather than just vivid examples." + "</li>" +
                "</ol>" +
                "</div>"
        },
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
    "Systems": [
        {
            name: "Feedback Loops",
            details: "<b>What It Is</b>: A system where outputs are fed back into the system as inputs, either amplifying (positive feedback) or stabilizing (negative feedback) it." +
                "<br/> <b>Use Case</b>: Helps understand self-reinforcing cycles and control mechanisms in systems." +
                "<br/> <b>Example</b>: Social media algorithms reinforce engagement by showing more of what users interact with (positive feedback)."
        },
        {
            name: "Equilibrium",
            details: "<b>What It Is</b>: A stable state in a system where opposing forces are balanced." +
                "<br/> <b>Use Case</b>: Helps in understanding markets, ecosystems, and other systems that adjust to stabilize over time." +
                "<br/> <b>Example</b>: In economics, supply and demand reach equilibrium where the quantity supplied equals the quantity demanded."
        },
        {
            name: "Bottlenecks",
            details: "<b>What It Is</b>: A constraint that slows down a process or system." +
                "<br/> <b>Use Case</b>: Identifying and addressing bottlenecks can significantly improve efficiency." +
                "<br/> <b>Example</b>: A slow checkout process in a supermarket reduces the overall speed of customer service."
        },
        {
            name: "Scale",
            details: "<b>What It Is</b>: The ability of a system or business to grow while maintaining efficiency and performance." +
                "<br/> <b>Use Case</b>: Helps in designing systems and businesses that can expand without losing quality or control." +
                "<br/> <b>Example</b>: Cloud computing allows businesses to scale their storage and processing power as needed."
        },
        {
            name: "Margin of Safety",
            details: "<b>What It Is</b>: The buffer between a system’s limits and potential risks to prevent failure." +
                "<br/> <b>Use Case</b>: Helps in risk management by ensuring there is a cushion to absorb unexpected shocks." +
                "<br/> <b>Example</b>: Investors buy stocks at a price below their intrinsic value to reduce risk."
        },
        {
            name: "Churn",
            details: "<b>What It Is</b>: The rate at which customers, users, or employees leave a business or system over time." +
                "<br/> <b>Use Case</b>: Helps in understanding customer retention and business sustainability." +
                "<br/> <b>Example</b>: A subscription service tracks churn rate to measure how many users cancel each month."
        },
        {
            name: "Algorithms",
            details: "<b>What It Is</b>: A step-by-step set of rules or calculations designed to solve problems or process data." +
                "<br/> <b>Use Case</b>: Used in computing, decision-making, and automation to optimize efficiency." +
                "<br/> <b>Example</b>: Google Search ranks pages using complex algorithms based on relevance and authority."
        },
        {
            name: "Critical Mass",
            details: "<b>What It Is</b>: The minimum size or amount of something required to start and sustain a process or system." +
                "<br/> <b>Use Case</b>: Helps explain network effects and tipping points in business, technology, and social systems." +
                "<br/> <b>Example</b>: A new social media platform needs a critical mass of users before it becomes widely adopted."
        },
        {
            name: "Emergence",
            details: "<b>What It Is</b>: When complex patterns, behaviors, or properties arise from simple interactions of smaller components." +
                "<br/> <b>Use Case</b>: Helps explain how decentralized systems function without central control." +
                "<br/> <b>Example</b>: A school of fish moves as a single unit without any leader directing them."
        },
        {
            name: "Irreducibility",
            details: "<b>What It Is</b>: The idea that some systems cannot be fully understood by breaking them down into smaller parts." +
                "<br/> <b>Use Case</b>: Helps in fields like complexity science and holistic problem-solving." +
                "<br/> <b>Example</b>: Consciousness cannot be fully explained by studying individual neurons in the brain."
        },
        {
            name: "The Law of Diminishing Returns",
            details: "<b>What It Is</b>: A principle stating that adding more of one input while keeping others constant eventually leads to smaller gains in output." +
                "<br/> <b>Use Case</b>: Helps in optimizing resource allocation and efficiency." +
                "<br/> <b>Example</b>: Increasing the number of workers on an assembly line eventually leads to inefficiencies."
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
