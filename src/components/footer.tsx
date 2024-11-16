
const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-6">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center">
                <p className="text-sm sm:text-base">
                    &copy; {new Date().getFullYear()} Dan Testehan. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
