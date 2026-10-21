# Plant Disease Prediction

A full-stack application for identifying plant leaf diseases from uploaded images. The React interface handles registration, login, image uploads, prediction history, and report downloads. An Express API manages authentication and saved predictions, while a Flask service runs the TensorFlow image classifier.

## Project layout

- `plant-disease-frontend/` — React web app
- `backend/` — Express API and MongoDB models
- `app.py` — Flask prediction API, served on port `5000`
- `plant_disease_model.h5` — trained TensorFlow model used by the prediction API
- `train_model.py` — training script
- `PlantVillage/` — local training data; excluded from Git

## Requirements

- Python 3 with pip
- Node.js and npm
- MongoDB, running locally or available through a connection URI

## Run locally

Start each service in a separate terminal from the repository root.

### 1. Flask prediction API

Install the Python packages and start the API from the repository root so it can find the model file:

```bash
python -m pip install Flask flask-cors tensorflow numpy pillow
python app.py
```

The API listens on `http://localhost:5000`.

### 2. Express API

Install the Node.js dependencies:

```bash
cd backend
npm install
```

Create a `backend/.env` file with your own MongoDB URI and a long, random JWT secret:

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/plant_disease
JWT_SECRET=replace-with-a-long-random-secret
```

Then start the API:

```bash
npm start
```

The API listens on `http://localhost:5001` by default. Set `PORT` to change it. `FLASK_URL` can override the prediction service URL; its default is `http://localhost:5000/predict`.

### 3. React frontend

In another terminal:

```bash
cd plant-disease-frontend
npm install
npm start
```

The app opens at `http://localhost:3000`. By default it connects to the Flask API at `http://localhost:5000` and the Express API at `http://localhost:5001`. Set `REACT_APP_ML_BACKEND_URL` or `REACT_APP_AUTH_BACKEND_URL` in a local frontend environment file to use different URLs.

## Training

`train_model.py` expects the dataset at `PlantVillage/train/` and `PlantVillage/valid/`. The dataset is not included in this repository. After preparing those folders and installing the Python packages above, run:

```bash
python train_model.py
```

The script writes `plant_disease_model.h5` in the repository root.

## Local files and credentials

Keep real credentials in local `.env` files. Git ignores `.env` files, virtual environments, Python caches, Node.js dependencies, build output, and the `PlantVillage/` dataset.
