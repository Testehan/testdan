

const experiences = [
    { company: 'Wolters Kluwer', role: 'Security Champion', duration: '2021 - Present' },
    { company: 'Wolters Kluwer', role: 'Senior Java Backend Developer', duration: '2018 - Present' },
    { company: 'Accenture', role: 'Team Lead', duration: '2017 - 2018' },
    { company: 'Accenture', role: 'Java Developer', duration: '2014 - 2018' },
    { company: 'Siemens', role: 'Junior Java Developer', duration: '2013' },
    { company: 'Evoline', role: 'PL/SQL and Java Developer', duration: '2012-2013' },
];

const Experience = () => {
    return (
        <section id="experience" className="py-12 bg-gray-100 scroll-mt-16 sm:scroll-mt-20">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6">
                    Experience
                </h2>
                <div className="space-y-6">
                    {experiences.map((exp, index) => (
                        <div
                            key={index}
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-lg shadow-md">
                            {/* Role and Company */}
                            <div className="mb-4 sm:mb-0 sm:flex-1">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800">{exp.role}</h3>
                                <p className="text-gray-600">{exp.company}</p>
                            </div>
                            {/* Duration */}
                            <span className="text-sm sm:text-base text-gray-500 flex-shrink-0">
                        {exp.duration}
                    </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>

    );
};

export default Experience;
