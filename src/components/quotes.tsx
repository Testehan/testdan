import { useState } from "react";

const quotes = [
    { text: "Stay hungry stay foolish.", author: "Steve Jobs" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "It is remarkable how much long-term advantage people like us have gotten by trying to be consistently not stupid, instead of trying to be very intelligent.", author: "Charlie Munger" },
    { text: "Develop into a lifelong self-learner through voracious reading; cultivate curiosity and strive to become a little wiser every day.", author: "Charlie Munger" },
    { text: "The safest way to try to get what you want is to try to deserve what you want.", author: "Charlie Munger" },
    { text: "Every mischance in life is an opportunity to behave well and learn. It’s not to be immersed in self-pity but to utilize the blow constructively.", author: "Charlie Munger" },
    { text: "In my whole life, I have known no wise people who didn’t read all the time — none, zero.", author: "Charlie Munger" },
    { text: "The iron rule of life is that only 20% of the people can be in the top fifth.", author: "Charlie Munger" },
    { text: "Every time you find your drifting into self-pity, I don’t care what the cause, your child could be dying from cancer, self-pity is not going to improve the situation. It’s a ridiculous way to behave. Life will have terrible blows, horrible blows, unfair blows — it doesn’t matter. Some people recover and others don’t.", author: "Charlie Munger" },
    { text: "A hero can be anyone, even a man doing something as simple and reassuring as putting a coat on a young boy's shoulders to let him know that the world hadn't ended.", author: "Batman" },
    { text: "Ignorance more frequently begets confidence than does knowledge.", author: "Charles Darwin" },
    { text: "Discipline beats motivation.", author: "Jocko Willink" },
    { text: "The one who plants trees, knowing that he will never sit in their shade, has at least started to understand the meaning of life.", author: "Rabindranath Tagore" },
    { text: "Here lies Epictetus, a slave maimed in body, the ultimate in poverty, and favored by the gods.", author: "Epictetus" },
    { text: "...whether it relates to the things which are in our power or to the things which are not in our power: and if it relates to anything which is not in our power, be ready to say, that 'It does not concern you'.", author: "Epictetus" },
    { text: "Remember that in life you ought to behave as at a banquet. Suppose that something is carried round and is opposite to you. Stretch out your hand and take a portion with decency. Suppose that it passes by you. Do not detain it. Suppose that it is not yet come to you. Do not send your desire forward to it, but wait till it is opposite to you. Do so with respect to children, so with respect to a wife, so with respect to magisterial offices, so with respect to wealth, and you will be some time a worthy partner of the banquets of the gods. But if you take none of the things which are set before you, and even despise them, then you will be not only a fellow banqueter with the gods, but also a partner with them in power.", author: "Epictetus" },
    { text: "Remember that you are an actor in a play, which is as the author [i.e., God] wants it to be: short, if he wants it to be short; long, if he wants it to be long. If he wants you to act a poor man, a cripple, a public official, or a private person, see that you act it with skill. For it is your job to act well the part that is assigned to you; but to choose it is another's.", author: "Epictetus" },
    { text: "You can be invincible, if you enter into no contest in which it is not in your power to conquer...But you yourself will not wish to be a general or senator or consul, but a free man: and there is only one way to this, to despise (care not for) the things which are not in our power.", author: "Epictetus" },
    { text: "If you have received the impression of any pleasure, guard yourself against being carried away by it; but let the thing wait for you, and allow yourself a certain delay on your own part.", author: "Epictetus" },
    { text: "The condition and characteristic of an uninstructed person is this: he never expects from himself profit (advantage) nor harm, but from externals. The condition and characteristic of a philosopher is this: he expects all advantage and all harm from himself.", author: "Epictetus" },
];

const QuotesSection = () => {
    const [currentQuote, setCurrentQuote] = useState(0);

    const handleNextQuote = () => {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * quotes.length);
        } while (randomIndex === currentQuote);
        setCurrentQuote(randomIndex);
    };

    return (
        <section id="quotes" className="py-12 bg-gray-100 scroll-mt-16 sm:scroll-mt-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6">
                Get inspired by favourite quotes
            </h2>
            <div className="flex flex-col items-center justify-center bg-gray-100">
                <div className="max-w-2xl bg-white shadow-lg rounded-lg p-8 text-center">
                    <blockquote className="text-2xl italic text-gray-800">
                        "{quotes[currentQuote].text}"
                    </blockquote>
                    <p className="mt-4 text-lg font-semibold text-gray-600">- {quotes[currentQuote].author}</p>
                </div>
                <button
                    onClick={handleNextQuote}
                    className="mt-6 px-6 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition duration-300 shadow-md"
                >
                    Next Quote
                </button>
            </div>
        </section>
    );
};

export default QuotesSection;