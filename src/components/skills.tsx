

const skills = ['Java', 'Web Application Security', 'Maven', 'Git', 'Spring-Web', 'Spring-Security', 'Spring-AI', 'Hibernate','jUnit', 'mockito','TailwindCSS', 'jQuery', 'Javascript' , 'React', 'MongoDB', 'OracleDB'];

const Skills = () => {
    return (
        <section id="skills" className="py-12 bg-gray-100 scroll-mt-16 sm:scroll-mt-20">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6">
                    Skills
                </h2>
                <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                    {skills.map((skill, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 sm:px-4 sm:py-2 bg-yellow-200 text-yellow-900 rounded-full shadow-md text-sm sm:text-base font-medium hover:bg-yellow-300 transition-colors duration-300"
                        >
                    {skill}
                </span>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;
