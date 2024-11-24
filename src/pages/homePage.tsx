import {ToastContainer} from "react-toastify";

import Header from '../components/header';
import About from '../components/about';
import Skills from '../components/skills';
import Projects from '../components/projects';
import Experience from '../components/experience';
import Contact from '../components/contact';
import Footer from '../components/footer';
import QuotesSection from '../components/quotes.tsx';

import '../App.css'
import 'react-toastify/dist/ReactToastify.css'

function HomePage() {

    return (
        <>
            <ToastContainer/>
            <div className="font-sans text-gray-900">
                <Header />
                <main>
                    <About />
                    <Skills />
                    <Experience />
                    <Projects />
                    <QuotesSection />
                    <Contact />
                </main>
                <Footer />
            </div>
        </>
    )
}

export default HomePage
