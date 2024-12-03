import pyttsx3

engine = pyttsx3.init()
engine.setProperty('rate', 150)  # Velocidad de habla
engine.setProperty('volume', 0.9)  # Volumen

# Lista de voces disponibles
voices = engine.getProperty('voices')
for voice in voices:
    print(f"Voice: {voice.name}, ID: {voice.id}")

# Selecciona la primera voz disponible
engine.setProperty('voice', voices[0].id)

engine.say("Prueba de sonido. A sus órdenes... jefe!")
engine.runAndWait()