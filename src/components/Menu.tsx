import { Link } from 'react-router-dom';

function Menu() {
    return (
        <div className="text-center mb-4 flex justify-center space-x-4">
            <Link to="/stocks">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Home
                </button>
            </Link>
            <Link to="/alerts">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Alerts
                </button>
            </Link>
        </div>
    );
}

export default Menu;
