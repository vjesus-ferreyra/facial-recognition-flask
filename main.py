import os
import cv2
import numpy as np
import face_recognition
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__, static_folder='static')
CORS(app)  # Añade soporte para CORS

# Cargar y codificar rostros conocidos
known_faces = []
known_names = []

for filename in os.listdir('images'):
    if filename.endswith(('jpg', 'jpeg', 'png')):
        image_path = os.path.join('images', filename)
        image = face_recognition.load_image_file(image_path)
        encodings = face_recognition.face_encodings(image)

        if encodings:
            known_faces.append(encodings[0])
            known_names.append(os.path.splitext(filename)[0])
        else:
            print(f"Advertencia: No se detectó ningún rostro en la imagen {filename}")


def recognize_faces(image_bytes):
    np_img = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_img)
    face_encodings = face_recognition.face_encodings(rgb_img, face_locations)

    for face_encoding in face_encodings:
        matches = face_recognition.compare_faces(known_faces, face_encoding)
        if True in matches:
            match_index = matches.index(True)
            return known_names[match_index]

    return None


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/detect', methods=['POST'])
def detect():
    image = request.files['frame'].read()
    person_name = recognize_faces(image)
    if person_name:
        return jsonify({"message": f"Persona detectada: {person_name}. Bienvenid@"})
    else:
        return jsonify({"message": "No se reconoció a ninguna persona"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000, ssl_context='adhoc')  # Opcional: ssl_context para HTTPS
