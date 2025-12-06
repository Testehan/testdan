const formatDescription = (description: string) => {
    const lines = description.split('\n');
    return lines.map((line, index) => {
        if (line.startsWith('**') && line.endsWith('**')) {
            return <p key={index} className="font-bold mt-4 mb-1">{line.replace(/\*\*/g, '')}</p>;
        }
        if (line.startsWith('•')) {
            return <p key={index} className="ml-4">{line}</p>;
        }
        if (line.trim() === '') {
            return <br key={index} />;
        }
        return <p key={index}>{line}</p>;
    });
};

const projects = [
    { title: 'www.casamia.ai 2025', description: `
A full-stack Spring Boot application that provides an AI-driven conversational interface for real estate property searches. Users can chat with an intelligent assistant to find apartments and houses based on their preferences (location, budget, rent vs. buy).

**Key Features:**
• Conversational AI powered by Spring AI (OpenAI GPT & Google Gemini)
• Semantic search using vector embeddings stored in MongoDB Atlas
• WhatsApp integration via Maytapi for lead capture
• Real-time updates using Server-Sent Events (SSE)
• Multi-channel notifications (Email, SMS, WhatsApp)
• AWS S3 for image storage, SES for emails, SNS for notifications
• HTMX-based reactive frontend with Thymeleaf
• Lead management and conversation tracking
• OAuth2 + basic authentication security

**Tech Stack:**
 Java 21, Spring Boot, Spring AI, MongoDB, HTMX, AWS SDK` },
    { title: 'City Audio Guide 2019', description: `An audio guide app that allows users to explore cities through narrated audio content.

**Key Features:**
• Multi-city audio guides: Download and explore audio guides for various cities (Barcelona, Lisbon, Bucharest, London, etc.)
• Chapter-based navigation: Each attraction has multiple audio chapters with seekbar controls and auto-play functionality
• Google Maps integration: View attractions on an interactive map
• In-app purchases: Free and paid city packages via Google Play Billing
• Firebase backend: Authentication (Google & Email), Real-time Database for city/attraction data, Cloud Storage for audio files
• Offline support: Downloaded audio files work without internet
• User accounts: Firebase Auth for user management and purchase tracking
• Analytics: Firebase Analytics for tracking user events

**Tech Stack:**
 Java, Android SDK, Firebase (Auth, Database, Storage, Analytics), Google Play Billing, Google Maps API` },
    { title: 'Source Code Translation in Eclipse 2016', description: `An Eclipse IDE plugin that translates Java source code elements (variables, method names, class names) in real-time.

**Key Features:**
• Hover Translation: Hover over any Java code element to see its translation
• Customizable Translations: Configure translations through Eclipse preferences
• Quick Commands: Reload (Ctrl+4) or deactivate (Ctrl+5) the plugin via keyboard shortcuts
• CamelCase Support: Automatically handles camelCase naming conventions

**Tech Stack:**
 Java, Eclipse RCP/Plugin development framework` },
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
                            <div className="text-sm sm:text-base text-gray-700">
                                {formatDescription(project.description)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Projects;