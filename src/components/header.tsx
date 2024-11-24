import { useState } from 'react';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="bg-gray-800 text-white py-4 sticky top-0 z-50 shadow-lg">
            <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 md:px-8">
                {/* Logo */}
                <h1 className="text-xl sm:text-2xl font-bold">Dan Testehan</h1>

                {/* Hamburger Menu for Mobile */}
                <button
                    className="sm:hidden text-white focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle navigation">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                        />
                    </svg>
                </button>

                {/* Navigation Links */}
                <nav
                    className={`${
                        isOpen ? 'block' : 'hidden'
                    } sm:block absolute sm:static top-12 left-0 w-full sm:w-auto bg-gray-800 sm:bg-transparent z-50`}>
                    <ul className="flex flex-col sm:flex-row sm:space-x-4 text-center sm:text-left">
                        <li>
                            <a href="#about" onClick={() => setIsOpen(!isOpen)} className="block py-2 sm:py-0 hover:text-yellow-400">
                                About
                            </a>
                        </li>
                        <li>
                            <a href="#skills" onClick={() => setIsOpen(!isOpen)} className="block py-2 sm:py-0 hover:text-yellow-400">
                                Skills
                            </a>
                        </li>
                        <li>
                            <a href="#experience" onClick={() => setIsOpen(!isOpen)} className="block py-2 sm:py-0 hover:text-yellow-400">
                                Experience
                            </a>
                        </li>
                        <li>
                            <a href="#projects" onClick={() => setIsOpen(!isOpen)} className="block py-2 sm:py-0 hover:text-yellow-400">
                                Projects
                            </a>
                        </li>
                        <li>
                            <a href="#quotes" onClick={() => setIsOpen(!isOpen)} className="block py-2 sm:py-0 hover:text-yellow-400">
                                Quotes
                            </a>
                        </li>
                        <li>
                            <a href="#contact" onClick={() => setIsOpen(!isOpen)} className="block py-2 sm:py-0 hover:text-yellow-400">
                                Contact
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;