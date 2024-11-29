import { useState } from "react";

const quotes = [
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
    { text: "Here lies Epictetus, a slave maimed in body, the ultimate in poverty, and favored by the gods.", author: "Epictetus" },
    { text: "...whether it relates to the things which are in our power or to the things which are not in our power: and if it relates to anything which is not in our power, be ready to say, that 'It does not concern you'.", author: "Epictetus" },
    { text: "whether it relates to the things which are in our power or to the things which are not in our power: and if it relates to anything which is not in our power, be ready to say, that it does not concern you.", author: "Epictetus" },
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