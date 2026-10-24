Lancer en local (deux terminaux) :

bash
# Terminal 1
> cd airtrack/site-vitrine/backend
> python -m venv .venv && source .venv/Scripts/activate   # Git Bash sous Windows
> pip install -r requirements.txt
> cp .env.example .env
> python manage.py migrate
> python manage.py runserver 0.0.0.0:8000

# Terminal 2
> cd airtrack/site-vitrine/frontend
> npm install
> npm run dev