import myPicture from '../../public/picture.jpg';

const About = () => {
    return (
        <section id="about" className="py-12 bg-gray-100 scroll-mt-16 sm:scroll-mt-20">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 flex flex-col lg:flex-row items-center">
                {/* Image Section */}
                <div className="lg:w-1/2 flex justify-center mb-6 lg:mb-0">
                    <img
                        src={myPicture}
                        alt="Dan Testehan"
                        className="rounded-lg w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-64 lg:h-72 shadow-lg object-top object-cover"
                    />
                </div>

                {/* About Me Text */}
                <div className="lg:w-1/2 text-center lg:text-left">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                        About Me
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-4">
                        Hi! I'm <b>Test</b>ehan <b>Dan</b> , a software developer based in Cluj-Napoca, Romania. My programming journey
                        began in 2004 with Pascal, and over the years, I’ve explored a diverse range of technologies.
                    </p>
                    <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-4">
                        For the past decade, I’ve specialized in the Java ecosystem, leveraging it to build scalable,
                        high-quality solutions. I’m passionate about crafting efficient and elegant software and
                        continually growing as a developer.
                    </p>
                    <p className="text-sm sm:text-base md:text-lg text-gray-700">
                        <i>"In my whole life, I have known no wise people who didn’t read all the time — none, zero." Charlie Munger</i>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default About;
