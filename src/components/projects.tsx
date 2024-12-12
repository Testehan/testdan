

const projects = [
    { title: 'Project AI', description: 'Coming soon :)' },
    { title: 'City Audio Guide 2019', description: 'Android app with audio guides for the important attractions of a city. Used Firebase, Google Text-to-Speech' },
    { title: 'Source Code Translation in Eclipse 2016', description: 'Plugin in Eclipse IDE tries to help developers working on a codebase written in a foreign language.' },
    { title: 'City\'s Menu 2013', description: 'Android app for ordering food. Backend written in Python and hosted in GAE.' },
];

const Projects = () => {
    return (
        <section id="projects" className="py-12 bg-gray-100 scroll-mt-16 sm:scroll-mt-20">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6">
                    Personal Projects
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                            <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-800">
                                {project.title}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-700">
                                {project.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

    );
};

export default Projects;
