import React, { useRef, useState } from 'react';
import { toast } from "react-toastify";

import emailjs from '@emailjs/browser';
import Joi from 'joi-browser';
import ValidationErrorItem from "joi-browser";


const Contact = () => {
    const form = useRef<HTMLFormElement | null>(null);

    const [formData, setFormData] = useState({ user_name: '', user_email: '', message: '' });
    const [_errors, setErrors] = useState({});

    const schema = {
        user_name: Joi.string().required().label('Your Name'),
        user_email: Joi.string().email({ tlds: { allow: false } }).required().label('Your Email'),
        message: Joi.string().required().label('Message')
    };

    // Handle input changes
    const handleChange = (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const sendEmail = (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate form data
        const { error } = Joi.validate(formData, schema, { abortEarly: false });
        if (error) {
            // Map Joi errors to the errors state
            const errorMessages : {[key: string]: string} = {};
            error.details.forEach((item : ValidationErrorItem) => {
                errorMessages[item.path[0]] = item.message;
                toast.error(item.message);
            });
            setErrors(errorMessages);
            return;
        }

        emailjs
            .sendForm('service_zarj1ep', 'template_r3tj0qj', form.current!, {
                publicKey: 'Nc9IU4enMFiqEX8QI',
            })
            .then(
                () => {
                    console.log('SUCCESS!');
                    // Reset form fields
                    if (form.current) {
                        form.current.reset();
                    }
                    setErrors({});
                    toast.info("Email sent with success! Will reply ASAP");
                },
                (error) => {
                    console.log('FAILED...', error.text);
                    toast.error("Error: Email was not sent! Try again later.");
                },
            );
    };


    let section = <>
        <section id="contact" className="py-12 bg-gray-100 scroll-mt-16 sm:scroll-mt-20">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
                    Contact Me
                </h2>
                <form
                    ref={form}
                    onSubmit={sendEmail}
                    className="max-w-md md:max-w-lg lg:max-w-xl mx-auto space-y-4">
                    {/* Name Field */}
                    <input
                        type="text"
                        placeholder="Your Name"
                        name="user_name"
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        onChange={handleChange}
                    />

                    {/* Email Field */}
                    <input
                        type="email"
                        placeholder="Your Email"
                        name="user_email"
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        onChange={handleChange}
                    />

                    {/* Message Field */}
                    <textarea
                        placeholder="Your Message"
                        name="message"
                        className="w-full px-4 py-2 border rounded h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        onChange={handleChange}>
                    </textarea>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                        Send Message
                    </button>
                </form>

                <div className="mt-8 flex justify-center space-x-6">
                    <a
                        href="https://www.linkedin.com/in/testehan/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="w-6 h-6"
                        >
                            <path d="M22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.2.79 24 1.77 24h20.46c.98 0 1.77-.8 1.77-1.73V1.73C24 .77 23.21 0 22.23 0zM7.12 20.45H3.58V9h3.54v11.45zM5.35 7.48a2.07 2.07 0 110-4.15 2.07 2.07 0 010 4.15zM20.45 20.45h-3.54v-5.74c0-1.36-.03-3.11-1.89-3.11-1.89 0-2.18 1.47-2.18 2.99v5.86h-3.54V9h3.4v1.56h.05c.47-.89 1.61-1.83 3.31-1.83 3.54 0 4.2 2.33 4.2 5.35v6.37z" />
                        </svg>
                        <span>LinkedIn</span>
                    </a>
                    <a
                        href="https://github.com/Testehan"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 hover:text-black flex items-center space-x-2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="w-6 h-6"
                        >
                            <path d="M12 .5a11.49 11.49 0 00-3.63 22.42c.57.1.78-.24.78-.54v-2.06c-3.18.7-3.85-1.53-3.85-1.53-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.52-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.3-.51-1.52.12-3.17 0 0 .96-.31 3.15 1.18a10.73 10.73 0 015.73 0c2.19-1.49 3.15-1.18 3.15-1.18.63 1.65.24 2.87.12 3.17.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.4-5.27 5.68.42.36.79 1.08.79 2.17v3.22c0 .3.21.64.78.53A11.49 11.49 0 0012 .5z" />
                        </svg>
                        <span>GitHub</span>
                    </a>
                </div>
            </div>
        </section>

    </>;

    return section;
};

export default Contact;
