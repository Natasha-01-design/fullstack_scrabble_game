# Scrabble Game - Group 1

A full-stack Scrabble game application built with React frontend and Flask backend. Play against the computer or practice by yourself with this interactive word game.

## Features

- **User Authentication**: Secure login/signup system with session management
- **Game Modes**: Play against AI computer or practice solo
- **Real-time Gameplay**: Interactive Scrabble board with drag-and-drop tile placement
- **Score Tracking**: Automatic scoring with bonus multipliers (Double/Triple Letter/Word)
- **Game Persistence**: Save and resume games automatically
- **Game History**: View past games and statistics
- **Word Validation**: Built-in dictionary for word verification
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend

- **React 19** with Vite for fast development
- **React Router** for navigation
- **Axios** for API communication
- **CSS3** for styling and animations

### Backend

- **Flask** web framework
- **PostgreSQL** database with SQLAlchemy ORM
- **Flask-JWT-Extended** for authentication
- **Flask-CORS** for cross-origin requests
- **Flask-Migrate** for database migrations

## Project Structure

```
fullstack/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── ScrabbleBoard.jsx
│   │   │   ├── TileRack.jsx
│   │   │   ├── WordValidator.jsx
│   │   │   ├── Computer.jsx
│   │   │   └── NavBar.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── Game.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── History.jsx
│   │   └── App.jsx
│   └── package.json
└── server/            # Flask API
    ├── app/
    │   ├── models/        # Database models
    │   │   ├── player.py
    │   │   └── game.py
    │   └── routes/        # API endpoints
    │       ├── player.py
    │       └── game.py
    ├── migrations/        # Database migrations
    └── main.py
```

## Installation & Setup

### Prerequisites

- Node.js (v16+)
- Python (3.8+)
- PostgreSQL

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd server
pip install pipenv
pipenv install
pipenv shell

# Set up environment variables
cp .env.example .env  # Configure your database URL

# Run migrations
flask db upgrade

# Start the server
python main.py
```

### Environment Variables

Create a `.env` file in the server directory:

```
DATABASE_URL=postgresql://username:password@localhost/scrabble_db
JWT_SECRET_KEY=your-secret-key
FLASK_ENV=development
```

## Game Rules

- Place tiles on the board to form valid words
- First word must cross the center star (★)
- Each tile has a point value
- Bonus squares multiply letter or word scores
- Game ends when tile bag is empty or players pass consecutively
- Player with highest score wins

## API Endpoints

- `POST /player/signup` - User registration
- `POST /player/login` - User authentication
- `GET /player/check_loggedin` - Check session status
- `POST /game/save_game` - Save game state
- `GET /game/load_game` - Load existing game
- `POST /game/complete_game` - Mark game as finished

## Development

The application uses Vite for fast development with Hot Module Replacement (HMR). The backend API runs on port 5555 and frontend on port 5173 by default.

### Running Both Services

```bash
# Terminal 1 - Backend
cd server && pipenv shell && python main.py

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## Screenshots

_Add screenshots of your game interface here_

## Future Enhancements

- [ ] Multiplayer online gameplay
- [ ] Tournament mode
- [ ] Advanced AI difficulty levels
- [ ] Mobile app version
- [ ] Social features and leaderboards

## Contributing

This is a Phase 4 project for Moringa School.

**Built by Group 1 Members:**

- Jerry Omweno
- Paul Kimani
- Lincoln Ngugi
- Jayden
- Natasha Kawira

## License

This project is for educational purposes as part of Moringa School's curriculum.
