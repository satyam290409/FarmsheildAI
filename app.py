import os
import sqlite3
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, render_template, send_from_directory
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max upload size
DATABASE = os.path.join(BASE_DIR, 'farmshield.db')

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database initialization
def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS assessments (
            id TEXT PRIMARY KEY,
            crop TEXT,
            stage TEXT,
            soil_moisture REAL,
            temperature REAL,
            humidity REAL,
            disease TEXT,
            disease_confidence REAL,
            irrigation TEXT,
            explanation TEXT,
            safety_note TEXT,
            image_path TEXT,
            notes TEXT,
            timestamp TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Initialize DB on startup
init_db()

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def predict_disease_demo(crop, soil_moisture, temperature, humidity, has_image):
    """
    A deterministic demo function that predicts potential diseases based on conditions.
    Returns a tuple of (disease_string, confidence_float).
    """
    crop = str(crop).lower()
    
    # Calculate a dynamic risk score based on environmental extremes
    # Optimal temp: ~25C, Optimal hum: ~60%, Optimal moisture: ~50%
    temp_stress = abs(temperature - 25) / 10.0
    hum_stress = abs(humidity - 60) / 20.0
    moisture_stress = abs(soil_moisture - 50) / 20.0
    
    total_stress = temp_stress + hum_stress + moisture_stress
    
    # Base confidence that fluctuates slightly with inputs
    base_conf = 60 + (total_stress * 5)
    confidence = min(98.5, max(45.0, base_conf + (hash(crop) % 10)))
    
    prefix = ""
    if not has_image:
        confidence = max(20.0, confidence - 25.0)  # Lower confidence if no image
        prefix = "Environment Only: "
        
    if total_stress < 1.0:
        return f'{prefix}Healthy {crop.capitalize()} Pattern', round(confidence, 1)
        
    if crop == 'rice':
        if humidity > 75 and temperature > 22:
            return f'{prefix}Blast Risk detected', round(confidence + 5, 1)
        elif soil_moisture < 40:
            return f'{prefix}Drought Stress Indicators', round(confidence, 1)
        elif soil_moisture > 80:
            return f'{prefix}Bacterial Leaf Blight Risk', round(confidence, 1)
            
    elif crop == 'wheat':
        if temperature > 30:
            return f'{prefix}Heat Stress Indicators', round(confidence, 1)
        elif humidity > 70:
            return f'{prefix}Powdery Mildew Risk', round(confidence, 1)
            
    elif crop in ['corn', 'maize']:
        if soil_moisture < 35:
            return f'{prefix}Severe Drought Stress', round(confidence, 1)
        elif humidity > 80:
            return f'{prefix}Northern Corn Leaf Blight', round(confidence, 1)
            
    elif crop == 'tomato':
        if humidity > 75:
            return f'{prefix}Late Blight Risk', round(confidence, 1)
        elif soil_moisture < 45 and temperature > 28:
            return f'{prefix}Blossom End Rot Risk', round(confidence, 1)
            
    # Generic dynamic logic for any crop
    if humidity > 75:
        return f'{prefix}High Humidity Fungal Risk ({crop.capitalize()})', round(confidence, 1)
    elif temperature > 32:
        return f'{prefix}Heat Stress Indicators ({crop.capitalize()})', round(confidence, 1)
    elif soil_moisture < 35:
        return f'{prefix}Water Deficit Stress ({crop.capitalize()})', round(confidence, 1)
    elif soil_moisture > 75:
        return f'{prefix}Waterlogging Root Risk ({crop.capitalize()})', round(confidence, 1)
        
    return f'{prefix}Suboptimal Growth Pattern ({crop.capitalize()})', round(confidence, 1)

def calculate_irrigation(soil_moisture, temperature, humidity):
    """
    Calculates irrigation recommendation based on environmental factors.
    Returns a tuple of (recommendation_string, explanation_string).
    """
    # Adjust effective moisture based on temperature
    # High temp makes the soil moisture "feel" lower due to high evaporation
    effective_moisture = soil_moisture
    if temperature > 30:
        effective_moisture -= 5
    elif temperature < 15:
        effective_moisture += 5
        
    explanation = f"Current soil moisture is {soil_moisture}% with a temperature of {temperature}°C."
    
    if effective_moisture < 25:
        recommendation = 'IRRIGATE'
        explanation += " Moisture levels are critically low. Immediate irrigation is recommended to prevent severe crop stress."
    elif effective_moisture < 40:
        recommendation = 'IRRIGATE SOON'
        explanation += " Moisture is dropping below optimal levels. Plan to irrigate in the next 12-24 hours."
    elif effective_moisture < 60:
        recommendation = 'MONITOR'
        explanation += " Moisture is adequate but could drop if temperatures rise or no rainfall occurs."
    else:
        recommendation = 'HOLD'
        explanation += " Soil moisture is sufficient. No additional watering is needed at this time."
        
    return recommendation, explanation

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Renders the main dashboard HTML."""
    # Ensure there is a templates folder with an index.html, otherwise fallback
    template_path = os.path.join(app.root_path, 'templates', 'index.html')
    if os.path.exists(template_path):
        return render_template('index.html')
    else:
        return "FarmShield AI - Please add 'templates/index.html' to render the dashboard."

@app.route('/uploads/<name>')
def download_file(name):
    """Serves the uploaded images."""
    return send_from_directory(app.config["UPLOAD_FOLDER"], name)

@app.route('/api/assess', methods=['POST'])
def assess_crop():
    """
    Endpoint for submitting a new crop assessment.
    Expects multipart/form-data.
    """
    try:
        # Extract form data
        crop = request.form.get('crop', 'Unknown')
        stage = request.form.get('stage', 'Unknown')
        
        # Convert numeric values safely
        try:
            soil_moisture = float(request.form.get('soil_moisture', 0))
            temperature = float(request.form.get('temperature', 0))
            humidity = float(request.form.get('humidity', 0))
        except ValueError:
            return jsonify({'error': 'Invalid numeric data for moisture, temperature, or humidity'}), 400
            
        notes = request.form.get('notes', '')
        
        # Handle file upload
        image_path = None
        has_image = False
        if 'leaf' in request.files:
            file = request.files['leaf']
            if file and file.filename != '':
                if allowed_file(file.filename):
                    filename = secure_filename(f"{uuid.uuid4().hex}_{file.filename}")
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    file.save(file_path)
                    image_path = f"uploads/{filename}"
                    has_image = True
                else:
                    return jsonify({'error': 'Invalid file type. Allowed types: png, jpg, jpeg, gif, webp'}), 400

        # Run inference and calculations
        disease, confidence = predict_disease_demo(crop, soil_moisture, temperature, humidity, has_image)
        irrigation, explanation = calculate_irrigation(soil_moisture, temperature, humidity)
        
        # Prepare data model
        assessment_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat() + "Z"
        safety_note = "This is a prototype AI assessment. Field verification is advised."
        
        response_data = {
            "id": assessment_id,
            "crop": crop,
            "stage": stage,
            "soil_moisture": soil_moisture,
            "temperature": temperature,
            "humidity": humidity,
            "disease": disease,
            "disease_confidence": round(confidence, 1),
            "irrigation": irrigation,
            "explanation": explanation,
            "safety_note": safety_note,
            "image_path": image_path,
            "notes": notes,
            "timestamp": timestamp
        }
        
        # Save to database
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO assessments (
                id, crop, stage, soil_moisture, temperature, humidity, 
                disease, disease_confidence, irrigation, explanation, 
                safety_note, image_path, notes, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            assessment_id, crop, stage, soil_moisture, temperature, humidity,
            disease, confidence, irrigation, explanation,
            safety_note, image_path, notes, timestamp
        ))
        conn.commit()
        conn.close()
        
        return jsonify(response_data), 201

    except Exception as e:
        app.logger.error(f"Error processing assessment: {e}")
        return jsonify({'error': 'Internal server error processing assessment.'}), 500


@app.route('/api/history', methods=['GET'])
def get_history():
    """
    Returns the history of assessments, ordered by most recent first.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        assessments = conn.execute('SELECT * FROM assessments ORDER BY timestamp DESC').fetchall()
        conn.close()
        
        # Convert row objects to dictionaries
        history_list = []
        for row in assessments:
            history_list.append(dict(row))
            
        return jsonify(history_list), 200
        
    except Exception as e:
        app.logger.error(f"Error retrieving history: {e}")
        return jsonify({'error': 'Internal server error retrieving history.'}), 500

# Add simple CORS headers for all responses if needed
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
