import { Link } from 'react-router-dom';

const BASE_PATH = import.meta.env.VITE_BASE_PATH || '';

function Menu() {
    return (
        <div className="text-center mb-4 flex justify-center space-x-4">
            <Link to={BASE_PATH}>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Home
                </button>
            </Link>
            <Link to={`${BASE_PATH}/alerts`}>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Alerts
                </button>
            </Link>
            <Link to={`${BASE_PATH}/usage`}>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Usage
                </button>
            </Link>
        </div>
    );
}

export default Menu;
